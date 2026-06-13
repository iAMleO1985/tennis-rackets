#!/usr/bin/env python3
"""为 data/rackets.json 补 specs.weightUnstrungG（空拍/未穿线重量）。
来源策略：厂商标称重量优先（NOMINAL 映射），其余用 strung-16g 兜底估算。
幂等：已有该字段则跳过。
"""
import json

# 厂商标称空拍重量（g）。多数等于型号名里的克数或系列公认规格。
NOMINAL = {
    "babolat-pure-aero-2023": 300,
    "wilson-pro-staff-97-v14-2023": 315,
    "head-radical-mp-2023": 300,
    "wilson-clash-100-v2-2022": 295,
    "babolat-pure-drive-2025": 300,
    "yonex-ezone-100-2025": 300,
    "head-speed-mp-2024": 300,
    "wilson-blade-98-16x19-v9-2024": 304,
    "head-prestige-mp-2023": 305,
    "babolat-pure-aero-rafa-team-2023": 285,
    "yonex-vcore-95-2023": 310,
    "head-titanium-ti-s6-1996": 225,
    "head-extreme-mp-2024": 300,
    "babolat-pure-strike-98-16x19-2024": 305,
    "babolat-pure-aero-98-2023": 305,
    "wilson-blade-100-v9-2024": 300,
    "wilson-ultra-100-v5-2025": 300,
    "wilson-clash-100-pro-v2-2022": 310,
    "wilson-rf-01-2024": 305,
    "wilson-shift-99-2023": 300,
    "wilson-burn-100s-v5-2023": 300,
    "head-gravity-mp-2025": 295,
    "head-boom-mp-2024": 295,
    "head-speed-pro-2024": 310,
    "head-radical-pro-2023": 315,
    "head-instinct-mp-2025": 300,
    "head-extreme-pro-2024": 305,
    "yonex-ezone-98-2025": 305,
    "yonex-percept-97-2023": 310,
    "yonex-percept-100d-2023": 300,
    "babolat-boost-drive-2025": 260,
    "tecnifibre-tfight-305s-2025": 305,
    "tecnifibre-tf40-305-18x20-2024": 305,
    "tecnifibre-tfight-300-2025": 300,
    "tecnifibre-tfight-270-2025": 270,
    "prince-phantom-100x-305-2024": 305,
    "prince-ripstick-98-2025": 305,
    "prince-textreme-tour-100p-2022": 310,
    "prince-textreme-tour-95-2022": 320,
    "dunlop-cx-200-2024": 305,
    "dunlop-sx-300-2025": 300,
    "dunlop-fx-500-2025": 300,
    "dunlop-cx-200-tour-16x19-2024": 310,
}

STRING_WEIGHT = 16  # 一套线+避震器的典型重量 g

def main():
    d = json.load(open("data/rackets.json"))
    nom = est = skip = 0
    estimated = []
    for r in d:
        s = r["specs"]
        if "weightUnstrungG" in s:
            skip += 1
            continue
        if r["id"] in NOMINAL:
            s["weightUnstrungG"] = NOMINAL[r["id"]]
            nom += 1
        else:
            s["weightUnstrungG"] = round(s["weightStrungG"] - STRING_WEIGHT)
            est += 1
            estimated.append(r["id"])
    json.dump(d, open("data/rackets.json", "w"), ensure_ascii=False, indent=2)
    print(f"标称值 {nom} 支 | 兜底估算 {est} 支 | 已有跳过 {skip} 支 | 合计 {len(d)}")
    if estimated:
        print("兜底估算的（建议日后核实标称值）:")
        for i in estimated:
            print("  ", i)

if __name__ == "__main__":
    main()
