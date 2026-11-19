"""Exercise the CMS in an isolated site and private storage using the PHP test server."""
import base64
import copy
import http.cookiejar
import json
import os
from pathlib import Path
import shutil
import socket
import subprocess
import tempfile
import time
import unittest
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
PHP = os.environ.get("PHP_BIN", "php")


class Client:
    def __init__(self, base):
        self.base = base
        self.opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
        self.csrf = ""

    def request(self, action, body=None, expected=200, headers=None, raw=None):
        custom = dict(headers or {})
        payload = raw
        if body is not None:
            payload = json.dumps(body).encode()
            custom["Content-Type"] = "application/json"
        if payload is not None:
            custom.setdefault("X-CSRF-Token", self.csrf)
        request = urllib.request.Request(self.base + "/admin/api.php?action=" + action, data=payload, headers=custom)
        try:
            response = self.opener.open(request, timeout=15)
        except urllib.error.HTTPError as error:
            response = error
        data = response.read()
        status = response.status
        content_type = response.headers.get("Content-Type", "")
        response.close()
        assert status == expected, (action, status, data.decode(errors="replace"))
        if "application/json" in content_type:
            data = json.loads(data)
            self.csrf = data.get("csrf", self.csrf)
        return data


class CmsIntegration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temporary = tempfile.TemporaryDirectory(prefix="metromatika-cms-test-")
        cls.base = Path(cls.temporary.name)
        cls.site = cls.base / "site"
        cls.site.mkdir()
        for directory in ("cms", "admin", "assets", "layanan"):
            shutil.copytree(ROOT / directory, cls.site / directory, ignore=shutil.ignore_patterns("config.local.php", ".DS_Store"))
        for name in ("index.html", "robots.txt", "sitemap.xml"):
            shutil.copyfile(ROOT / name, cls.site / name)
        cls.private = cls.base / "private"
        with socket.socket() as address:
            address.bind(("127.0.0.1", 0))
            port = address.getsockname()[1]
        cls.url = f"http://127.0.0.1:{port}"
        cls.log = (cls.base / "php.log").open("w")
        cls.process = subprocess.Popen([PHP, "-S", f"127.0.0.1:{port}", "-t", str(cls.site)], env=dict(os.environ, METROMATIKA_CMS_STORAGE=str(cls.private)), stdout=cls.log, stderr=cls.log)
        for _ in range(100):
            try:
                urllib.request.urlopen(cls.url + "/admin/index.php", timeout=1).close()
                break
            except OSError:
                if cls.process.poll() is not None:
                    raise RuntimeError((cls.base / "php.log").read_text())
                time.sleep(0.05)
        cls.admin = Client(cls.url)
        status = cls.admin.request("status")
        assert not status["configured"]
        key = (cls.private / "setup-key.txt").read_text().strip()
        cls.admin.request("setup", {"key": "wrong", "username": "editor", "password": "Local-demo-password-2026"}, expected=401)
        cls.admin.request("setup", {"key": key, "username": "editor", "password": "密碼密碼密碼"}, expected=422)
        cls.admin.request("setup", {"key": key, "username": "editor", "password": "Local-demo-" + chr(0) + "-password-2026"}, expected=422)
        cls.admin.request("setup", {"key": key, "username": "editor", "password": "Local-demo-password-2026"})
        assert not (cls.private / "setup-key.txt").exists()

    @classmethod
    def tearDownClass(cls):
        cls.process.terminate()
        cls.process.wait(timeout=10)
        cls.log.close()
        cls.temporary.cleanup()

    def test_cms_workflow(self):
        client = self.admin
        guest = Client(self.url)
        guest.request("content", expected=401)
        client.request("save", {}, expected=403, headers={"X-CSRF-Token": "wrong"})
        client.request("save", {}, expected=403, headers={"Origin": "https://example.invalid"})
        client.request("save", {"oversized": "x" * 1500001}, expected=413)
        initial = client.request("content")["state"]
        values = copy.deepcopy(initial["draft"])
        baseline = (self.site / "index.html").read_text()
        second = Client(self.url)
        second.request("status")
        second.request("login", {"username": "editor", "password": "Local-demo-password-2026"})
        bad = copy.deepcopy(values)
        bad["site.logo"] = "../outside.png"
        client.request("save", {"version": initial["version"], "values": bad}, expected=422)
        bad = copy.deepcopy(values)
        bad["site.email"] = "javascript:alert(1)"
        client.request("save", {"version": initial["version"], "values": bad}, expected=422)
        bad = copy.deepcopy(values)
        bad["home.hero_title"] = None
        client.request("save", {"version": initial["version"], "values": bad}, expected=422)
        slug = "pengembangan-website"
        values["home.hero_title"] = "CMS demo\n<img src=x onerror=alert(1)>"
        values["site.whatsapp"] = "628123456789"
        values["site.email"] = "editor@example.test"
        values[f"services.{slug}.price_visible"] = True
        values[f"services.{slug}.price_amount"] = 250000
        client.request("save", {"version": initial["version"], "values": values}, expected=422)
        values[f"services.{slug}.price_unit"] = "per proyek demo"
        values["home.faq"][0]["answer"] = "Jawaban demo & aman <script>alert(1)</script>"
        draft = client.request("save", {"version": initial["version"], "values": values})["state"]
        second.request("save", {"version": initial["version"], "values": values}, expected=409)
        self.assertEqual((self.site / "index.html").read_text(), baseline)
        preview = client.request("preview&page=home").decode()
        self.assertIn("&lt;img src=x onerror=alert(1)&gt;", preview)
        self.assertNotIn("<img src=x", preview)
        self.assertIn('<base href="/">', preview)
        published = client.request("publish", {"version": draft["version"]})["state"]
        html = (self.site / "index.html").read_text()
        detail = (self.site / "layanan" / slug / "index.html").read_text()
        self.assertIn('data-whatsapp="628123456789"', html)
        self.assertTrue("https://wa.me/628123456789" in detail)
        self.assertIn("editor@example.test", detail)
        self.assertIn("Rp 250.000 per proyek demo", html)
        self.assertIn("Rp 250.000 per proyek demo", detail)
        self.assertIn("&lt;script&gt;alert(1)&lt;/script&gt;", html)
        self.assertNotIn("<script>alert(1)</script>", html)
        self.assertNotIn("{{@", html)
        self.assertFalse((self.private / "journal.json").exists())
        restored = client.request("restore", {"version": published["version"], "id": published["history"][0]["id"]})["state"]
        self.assertEqual(restored["draft"], initial["published"])
        self.assertEqual((self.site / "index.html").read_text(), html)
        subprocess.run([PHP, str(self.site / "cms/cli.php"), "render"], env=dict(os.environ, METROMATIKA_CMS_STORAGE=str(self.private)), check=True, capture_output=True)
        self.assertEqual(client.request("content")["state"]["draft"], initial["published"])
        self.assertEqual((self.site / "index.html").read_text(), html)
        # Simulate an interrupted multi-page publication, then request recovery.
        journal = {"state": restored, "pages": {"index.html": html}}
        (self.private / "journal.json").write_text(json.dumps(journal))
        (self.site / "index.html").write_text("partial publication")
        recovered = client.request("content")["state"]
        self.assertEqual(recovered["version"], restored["version"])
        self.assertEqual((self.site / "index.html").read_text(), html)
        self.assertFalse((self.private / "journal.json").exists())
        # Only generated image paths and verified image MIME types are accepted.
        boundary = "metromatika-test-boundary"
        def multipart(data):
            return (f'--{boundary}\r\nContent-Disposition: form-data; name="image"; filename="demo.png"\r\nContent-Type: image/png\r\n\r\n'.encode() + data + f"\r\n--{boundary}--\r\n".encode())
        upload_headers = {"Content-Type": "multipart/form-data; boundary=" + boundary}
        client.request("upload", raw=multipart(b"<html>bad image</html>"), headers=upload_headers, expected=422)
        png = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZ1kAAAAASUVORK5CYII=")
        image = client.request("upload", raw=multipart(png), headers=upload_headers)
        self.assertTrue((self.site / image["path"]).is_file())
        self.assertTrue(any(item["path"] == image["path"] for item in client.request("media")["items"]))
        client.request("password", {"current": "Local-demo-password-2026", "password": "Changed-local-demo-2026!"})
        second.request("content", expected=401)
        client.request("logout", {})
        client.request("status")
        client.request("login", {"username": "editor", "password": "Local-demo-password-2026"}, expected=401)
        client.request("login", {"username": "editor", "password": "Changed-local-demo-2026!"})
        client.request("logout", {})
        client.request("status")
        for _ in range(10):
            client.request("login", {"username": "editor", "password": "invalid-password"}, expected=401)
        client.request("login", {"username": "editor", "password": "invalid-password"}, expected=429)


if __name__ == "__main__":
    unittest.main(verbosity=2)
