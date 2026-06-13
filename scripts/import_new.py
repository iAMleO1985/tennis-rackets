#!/usr/bin/env python3
"""批量导入精选新型号：基本参数取 RF 真值，增值层（打法/水平/体验）按定位赋值。"""
import json, glob
from calibrate import parse_specs, find_rf, RF, update_meta_from_name  # noqa

# (id, rf_name, brand, series, priceRange, playStyle, levels, requirement, experience, notes)
# playStyle: [(tag, fit)]  experience: comfort,maneuver,forgive,power,control,spin
P = lambda *x: list(x)
CURATED = [
    ("babolat-pure-strike-98-16x19-2024", "Babolat Pure Strike 98 16x19 - 2024", "Babolat", "Pure Strike", "high",
     [("aggressiveBaseline",5),("flat",4),("allCourt",4)], ["advanced","pro"],
     (2,5,4), (4,3,3,3,5,4), "蒂姆代言系列，控制型进攻框，干脆利落的击球反馈，适合技术型底线进攻。"),
    ("babolat-pure-aero-98-2023", "Babolat Pure Aero 98 -2023", "Babolat", "Pure Aero", "high",
     [("topspin",5),("aggressiveBaseline",5),("allCourt",3)], ["advanced","pro"],
     (3,4,4), (3,4,3,4,4,5), "Pure Aero 的 98 拍面版，更紧凑、更可控，重旋转进攻型高阶之选。"),
    ("wilson-blade-100-v9-2024", "Wilson Blade 100 v9 - 2024", "Wilson", "Blade", "high",
     [("allCourt",5),("topspin",4),("aggressiveBaseline",4)], ["intermediate","advanced"],
     (3,4,3), (3,4,4,3,4,4), "Blade 家族的 100 拍面版，比 98 更易上手、容错更高，全场均衡。"),
    ("wilson-ultra-100-v5-2025", "Wilson Ultra 100 v5 - 2025", "Wilson", "Ultra", "high",
     [("aggressiveBaseline",4),("allCourt",4),("flat",4)], ["intermediate","advanced"],
     (4,3,3), (4,4,4,4,3,4), "力量与舒适兼顾的现代框，甜区大、出球轻松，进阶全能型友好。"),
    ("wilson-clash-100-pro-v2-2022", "Wilson Clash 100 Pro v2 - 2022", "Wilson", "Clash", "high",
     [("allCourt",4),("topspin",4),("defensive",3)], ["advanced","pro"],
     (2,4,4), (5,3,3,3,5,4), "Clash Pro 版，更重更稳，保留招牌柔韧手感的同时提升控制，适合高阶。"),
    ("wilson-rf-01-2024", "Wilson RF 01 - 2024", "Wilson", "RF", "premium",
     [("flat",5),("allCourt",4),("serveAndVolley",4)], ["advanced","pro"],
     (2,5,5), (4,3,2,3,5,3), "费德勒亲自参与设计的全新控制框，接替 Pro Staff RF97，纯粹手感与精准。"),
    ("wilson-shift-99-2023", "Wilson Shift 99 - 2023", "Wilson", "Shift", "high",
     [("topspin",4),("aggressiveBaseline",4),("allCourt",4)], ["intermediate","advanced"],
     (3,4,3), (4,4,3,3,4,4), "Wilson 全新系列，柔韧灵活、过渡顺滑，主打灵动操控的现代打法。"),
    ("wilson-burn-100s-v5-2023", "Wilson Burn 100S v5 - 2023", "Wilson", "Burn", "high",
     [("topspin",5),("aggressiveBaseline",4)], ["intermediate","advanced"],
     (4,3,3), (3,4,4,4,3,5), "18x16 稀疏弦床，专为暴力上旋设计，出球转速极高。"),
    ("head-gravity-mp-2025", "Head Gravity MP - 2025", "Head", "Gravity", "high",
     [("allCourt",5),("topspin",4),("defensive",4)], ["intermediate","advanced"],
     (3,4,3), (5,4,4,3,4,4), "兹维列夫代言系列，舒适柔软、控制出色，全场型与防守反击俱佳。"),
    ("head-boom-mp-2024", "Head Boom MP - 2024", "Head", "Boom", "high",
     [("aggressiveBaseline",4),("topspin",4),("allCourt",4)], ["intermediate","advanced"],
     (4,3,3), (5,4,4,4,3,4), "Head 主打舒适+力量的现代框，弹性好、易发力，进阶全能友好。"),
    ("head-speed-pro-2024", "Head Speed Pro - 2024", "Head", "Speed", "high",
     [("allCourt",5),("flat",4),("aggressiveBaseline",4)], ["advanced","pro"],
     (2,5,5), (3,3,3,3,5,4), "德约科维奇实际使用的 Pro 版，重而稳、控制极致，对技术要求高。"),
    ("head-radical-pro-2023", "Head Radical Pro - 2023", "Head", "Radical", "high",
     [("aggressiveBaseline",4),("allCourt",4),("topspin",4)], ["advanced","pro"],
     (2,5,4), (3,3,3,3,5,4), "Radical 的 Pro 重头版，稳定有力，适合追求控制的高阶底线选手。"),
    ("head-instinct-mp-2025", "Head Instinct MP - 2025", "Head", "Instinct", "high",
     [("aggressiveBaseline",4),("flat",4),("allCourt",3)], ["beginner","intermediate"],
     (5,2,2), (4,4,5,5,3,3), "Head 力量型代表，甜区大、出球轻松，适合进阶过渡与力量不足者。"),
    ("head-extreme-pro-2024", "Head Extreme Pro - 2024", "Head", "Extreme", "high",
     [("topspin",5),("aggressiveBaseline",5),("allCourt",3)], ["advanced","pro"],
     (3,4,4), (3,3,3,4,4,5), "Extreme 系列旗舰，开放弦床+重头，重上旋进攻的高阶利器。"),
    ("yonex-ezone-98-2025", "Yonex EZONE 98 - 2025", "Yonex", "EZONE", "high",
     [("allCourt",5),("aggressiveBaseline",4),("topspin",4)], ["advanced","pro"],
     (3,4,4), (4,3,3,3,5,4), "巡回赛热门控制框，手感扎实、控制与旋转兼备，高阶全能之选。"),
    ("yonex-percept-97-2023", "Yonex Percept 97 - 2023", "Yonex", "Percept", "high",
     [("flat",5),("allCourt",4),("aggressiveBaseline",4)], ["advanced","pro"],
     (2,5,5), (5,3,2,2,5,3), "接替 VCORE Pro，柔韧细腻、控制至上，瓦林卡风格的纯控制框。"),
    ("yonex-percept-100d-2023", "Yonex Percept 100D - 2023", "Yonex", "Percept", "high",
     [("aggressiveBaseline",4),("topspin",4),("allCourt",4)], ["intermediate","advanced"],
     (3,4,3), (4,3,4,4,4,4), "Percept 100 的厚框 D 版，更有力量，控制与力量平衡的全场框。"),
    ("babolat-boost-drive-2025", "Babolat Boost Drive - 2025", "Babolat", "Boost", "budget",
     [("aggressiveBaseline",4),("flat",3),("defensive",3)], ["beginner"],
     (5,1,1), (4,5,5,5,2,3), "轻量大拍面入门款，省力易挥，预算有限的初学者友好之选。"),
]

def build(entry):
    (rid, rfname, brand, series, price, ps, levels, req, exp, notes) = entry
    name, spec = find_rf(rfname)
    if not spec:
        return None, rfname
    specs = parse_specs(spec)
    specs.setdefault("gripSizes", ["L1","L2","L3","L4"])
    meta = {"brand": brand, "model": "", "year": 0, "series": series,
            "priceRange": price, "imageUrl": "",
            "sources": ["https://www.racquetfinder.com"]}
    update_meta_from_name(meta, name)
    c,m,f,pw,ct,sp = exp
    return {
        "id": rid, "meta": meta, "specs": specs,
        "playStyle": [{"tag": t, "fit": fi} for t, fi in ps],
        "skillLevel": {"levels": levels,
                       "requirement": {"power": req[0], "controlSkill": req[1], "physical": req[2]}},
        "experience": {"comfort": c, "maneuverability": m, "forgiveness": f,
                       "power": pw, "control": ct, "spinPotential": sp},
        "notes": notes, "verified": True,
    }, None

def main():
    cur = json.load(open("data/rackets.json"))
    have = {r["id"] for r in cur}
    added = 0
    for e in CURATED:
        rec, miss = build(e)
        if miss:
            print(f"✗ 未匹配: {miss}"); continue
        if rec["id"] in have:
            print(f"· 已存在跳过: {rec['id']}"); continue
        cur.append(rec); added += 1
        print(f"✓ {rec['meta']['brand']} {rec['meta']['model']} {rec['meta']['year']}")
    json.dump(cur, open("data/rackets.json", "w"), ensure_ascii=False, indent=2)
    print(f"\n新增 {added} 支，库内合计 {len(cur)} 支")

if __name__ == "__main__":
    main()
