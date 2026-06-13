#!/usr/bin/env python3
"""从 racquetfinder.com 抓取并解析球拍参数。
服务端渲染，GET 提交表单即可，无需浏览器。
用法: python3 scripts/scrape_rf.py <Manufacturer> [出--json路径]
"""
import sys, re, json, urllib.parse, urllib.request, html as htmllib

BASE = "https://www.racquetfinder.com/"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"

def fetch(manufacturer):
    params = {
        "name": "", "manufacturer": manufacturer,
        "hsMin": "", "hsMax": "", "lMin": "", "lMax": "", "wMin": "", "wMax": "",
        "swMin": "", "swMax": "", "fMin": "", "fMax": "", "bpMin": "", "bpMax": "",
        "bwMin": "", "bwMax": "", "mains": "", "crosses": "", "max_price": "",
        "currentcheckbox": "on", "current": "Y",
    }
    url = BASE + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "ignore")

def clean(s):
    return htmllib.unescape(re.sub(r"\s+", " ", s)).strip()

def parse(html):
    rackets = []
    # 每个结果块: <div class="rac_name">NAME</div> ... 直到下一个 rac_name 或结尾
    blocks = re.split(r'<div class="rac_name">', html)[1:]
    for b in blocks:
        name = clean(b[:b.index("</div>")])
        # 抽所有 <th>KEY</th><td>VAL</td>
        pairs = re.findall(r"<th>(.*?)</th>\s*<td>(.*?)</td>", b, re.S)
        spec = {clean(k).rstrip(":"): clean(v) for k, v in pairs}
        if "Head Size" not in spec:
            continue
        rackets.append({"name": name, "specs": spec})
    return rackets

def main():
    if len(sys.argv) < 2:
        print("用法: scrape_rf.py <Manufacturer> [out.json]"); sys.exit(1)
    mfr = sys.argv[1]
    data = parse(fetch(mfr))
    print(f"{mfr}: 抓到 {len(data)} 支", file=sys.stderr)
    out = json.dumps(data, ensure_ascii=False, indent=2)
    if len(sys.argv) > 2:
        open(sys.argv[2], "w").write(out)
        print(f"已写入 {sys.argv[2]}", file=sys.stderr)
    else:
        print(out)

if __name__ == "__main__":
    main()
