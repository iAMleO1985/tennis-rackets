#!/usr/bin/env python3
"""用 RacquetFinder 抓取的真值校准 data/rackets.json 已有记录的基本参数。
保留 playStyle / skillLevel / experience / notes 等增值层；替换 specs；标 verified=true。
"""
import json, re, sys, glob

RF = {}
for f in glob.glob("/tmp/rf_*.json"):
    for r in json.load(open(f)):
        RF[r["name"]] = r["specs"]

def num(s):
    m = re.search(r"[-\d.]+", s or "")
    return float(m.group()) if m else None

def parse_specs(s):
    """RF 字符串字段 -> 我们 schema 的 specs"""
    out = {}
    if "Head Size" in s:
        out["headSize"] = int(num(s["Head Size"]))
    if "Strung Weight" in s:  # "11.20 oz / 318 g"
        m = re.search(r"([\d.]+)\s*oz\s*/\s*(\d+)\s*g", s["Strung Weight"])
        if m:
            out["weightStrungOz"] = float(m.group(1))
            out["weightStrungG"] = int(m.group(2))
    if "Balance" in s:  # "4pts HL" / "2pts HH" / "even"
        m = re.search(r"(\d+)\s*pts?\s*(HL|HH)", s["Balance"], re.I)
        if m:
            v = int(m.group(1))
            out["balancePts"] = -v if m.group(2).upper() == "HL" else v
        elif "even" in s["Balance"].lower():
            out["balancePts"] = 0
    if "Swing Weight" in s:
        sw = num(s["Swing Weight"])
        if sw: out["swingWeight"] = int(sw)
    if "Beam Width" in s:
        out["beamWidth"] = s["Beam Width"].replace("mm", "").strip()
    if "Tip/Shaft" in s:  # "23.0mm / 21.0mm"
        out["tipShaft"] = "/".join(re.findall(r"[\d.]+", s["Tip/Shaft"]))
    if "String Pattern" in s:  # "16 Mains/19 Crosses"
        m = re.search(r"(\d+)\s*Mains?\s*/\s*(\d+)", s["String Pattern"], re.I)
        if m:
            out["mains"] = int(m.group(1)); out["crosses"] = int(m.group(2))
    if "Main Skip" in s:
        out["mainSkip"] = s["Main Skip"]
    if "Stiffness" in s:
        st = num(s["Stiffness"])
        if st: out["stiffness"] = int(st)
    if "Composition" in s:
        out["composition"] = s["Composition"]
    if "Power Level" in s:
        out["powerLevel"] = s["Power Level"]
    if "String Tension" in s:
        out["stringTension"] = s["String Tension"]
    if "Length" in s:
        out["length"] = num(s["Length"])
    return out

# 库里 id -> RF name 的人工匹配映射。旧款已下架的，指向最新在售版本。
MATCH = {
    "babolat-pure-aero-2023": "Babolat Pure Aero - 2023",
    "wilson-pro-staff-97-v14-2023": "Wilson Pro Staff 97 v14 - 2023",
    "head-radical-mp-2023": "Head Radical MP - 2023",
    "wilson-clash-100-v2-2022": "Wilson Clash 100 v2 - 2022",
    "babolat-pure-drive-2021": "Babolat Pure Drive - 2025",
    "yonex-ezone-100-2022": "Yonex EZONE 100 - 2025",
    "head-speed-mp-2022": "Head Speed MP - 2024",
    "wilson-blade-98-v8-2021": "Wilson Blade 98 16x19 v9 - 2024",
    "head-prestige-mp-2021": "Head Prestige MP - 2023",
    "babolat-pure-aero-rafa-team-2023": "Babolat Pure Aero Team - 2023",
    "yonex-vcore-pro-97-2021": "Yonex VCORE 95 - 2023",
    "head-ti-s6-classic": "Head Titanium TI.S6 - 1996",
    "head-extreme-mp-2024": "Head Extreme MP - 2024",
}

def update_meta_from_name(meta, rfname):
    """用 RF 真实名回填 model/year，保证元信息与真值一致。"""
    m = re.search(r"-\s*(\d{4})\s*$", rfname)
    if m:
        meta["year"] = int(m.group(1))
        body = rfname[:m.start()].strip()
    else:
        body = rfname.strip()
    parts = body.split(None, 1)
    if len(parts) == 2:
        meta["model"] = parts[1].strip()

def find_rf(target):
    if target in RF: return target, RF[target]
    # 宽松匹配：去掉空格/大小写/标点
    norm = lambda x: re.sub(r"[^a-z0-9]", "", x.lower())
    nt = norm(target)
    for name, spec in RF.items():
        if norm(name) == nt: return name, spec
    # 包含匹配
    for name, spec in RF.items():
        if nt and nt in norm(name): return name, spec
    return None, None

def main():
    cur = json.load(open("data/rackets.json"))
    PRESERVE = {"weightStrungG", "weightUnstrungG"}  # 不被 None 覆盖
    matched = unmatched = 0
    for r in cur:
        want = MATCH.get(r["id"])
        rfname, rfspec = find_rf(want) if want else (None, None)
        if not rfspec:
            print(f"✗ 未匹配: {r['id']}  (找 {want!r})", file=sys.stderr)
            unmatched += 1
            continue
        new = parse_specs(rfspec)
        # 保留原 gripSizes
        if "gripSizes" in r["specs"]:
            new.setdefault("gripSizes", r["specs"]["gripSizes"])
        # 保留 RF 不提供、需沿用旧值的字段（如空拍重量）
        for k in PRESERVE:
            if k not in new and k in r["specs"]:
                new[k] = r["specs"][k]
        r["specs"] = new
        r["verified"] = True
        update_meta_from_name(r["meta"], rfname)
        matched += 1
        print(f"✓ {r['id']}  ←  {rfname}", file=sys.stderr)
    json.dump(cur, open("data/rackets.json", "w"), ensure_ascii=False, indent=2)
    print(f"\n校准 {matched} 支, 未匹配 {unmatched} 支", file=sys.stderr)

if __name__ == "__main__":
    main()
