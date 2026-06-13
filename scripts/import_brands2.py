#!/usr/bin/env python3
"""导入 Tecnifibre / Prince / Dunlop 主力型号。复用 import_new 的 build()。"""
import json
from import_new import build  # noqa

CURATED = [
    # ---- Tecnifibre ----
    ("tecnifibre-tfight-305s-2025", "Tecnifibre TFight 305S - 2025", "Tecnifibre", "TFight", "high",
     [("aggressiveBaseline",5),("allCourt",4),("flat",4)], ["advanced","pro"],
     (3,4,4), (4,3,3,3,5,4), "梅总（梅德韦杰夫）代言系列，扎实稳定、控制出色，高阶底线进攻框。"),
    ("tecnifibre-tf40-305-18x20-2024", "Tecnifibre TF40 305 18x20 - 2024", "Tecnifibre", "TF40", "high",
     [("flat",5),("allCourt",4),("serveAndVolley",4)], ["advanced","pro"],
     (2,5,5), (4,3,2,2,5,3), "18x20 密弦控制旗舰，手感纯粹、落点精准，纯控制型高手用拍。"),
    ("tecnifibre-tfight-300-2025", "Tecnifibre TFight 300 - 2025", "Tecnifibre", "TFight", "high",
     [("allCourt",5),("aggressiveBaseline",4),("topspin",4)], ["intermediate","advanced"],
     (3,4,3), (4,4,4,3,4,4), "TFight 标准 300g 版，控制与机动平衡，进阶到高阶的全场之选。"),
    ("tecnifibre-tfight-270-2025", "Tecnifibre TFight 270 - 2025", "Tecnifibre", "TFight", "mid",
     [("aggressiveBaseline",4),("topspin",4),("allCourt",3)], ["beginner","intermediate"],
     (4,3,2), (4,5,4,4,3,4), "轻量易挥版，省力灵活，适合进阶过渡与力量偏弱的选手。"),
    # ---- Prince ----
    ("prince-phantom-100x-305-2024", "Prince Phantom 100X (305g) - 2024", "Prince", "Phantom", "high",
     [("allCourt",5),("flat",4),("aggressiveBaseline",4)], ["advanced","pro"],
     (2,5,5), (5,3,3,2,5,3), "Phantom 系列招牌薄框控制，柔韧细腻、手感一流，控制型高阶最爱。"),
    ("prince-ripstick-98-2025", "Prince Ripstick 98 - 2025", "Prince", "Ripstick", "high",
     [("topspin",5),("aggressiveBaseline",4),("allCourt",3)], ["intermediate","advanced"],
     (3,4,4), (4,3,4,4,4,5), "Ripstick 主打旋转，独特弦床带来强烈上旋，进攻上旋型之选。"),
    ("prince-textreme-tour-100p-2022", "Prince ATS Textreme Tour 100P - 2022", "Prince", "Tour", "high",
     [("allCourt",5),("aggressiveBaseline",4),("topspin",4)], ["intermediate","advanced"],
     (3,4,3), (4,4,4,3,4,4), "Tour 100P 全场均衡框，舒适稳定、各项无短板，进阶全能友好。"),
    ("prince-textreme-tour-95-2022", "Prince ATS Textreme Tour 95 - 2022", "Prince", "Tour", "high",
     [("flat",5),("allCourt",4),("serveAndVolley",4)], ["advanced","pro"],
     (2,5,5), (4,2,2,2,5,3), "95 小拍面纯控制框，要求高、回报高，技术成熟者的精准武器。"),
    # ---- Dunlop ----
    ("dunlop-cx-200-2024", "Dunlop CX 200 - 2024", "Dunlop", "CX", "high",
     [("flat",5),("allCourt",4),("aggressiveBaseline",4)], ["advanced","pro"],
     (2,5,4), (4,3,3,2,5,3), "Dunlop 控制系列旗舰，扎实直接、落点精准，控制型进攻高阶用拍。"),
    ("dunlop-sx-300-2025", "Dunlop SX 300 - 2025", "Dunlop", "SX", "high",
     [("topspin",5),("aggressiveBaseline",4),("allCourt",3)], ["intermediate","advanced"],
     (3,4,4), (4,4,4,4,3,5), "SX 系列主打旋转，Sonic Core 减震+开放弦床，上旋进攻利器。"),
    ("dunlop-fx-500-2025", "Dunlop FX 500 - 2025", "Dunlop", "FX", "high",
     [("aggressiveBaseline",5),("topspin",4),("flat",4)], ["intermediate","advanced"],
     (4,3,3), (4,4,4,5,3,4), "FX 系列主打力量，宽框大甜区、出球爆发，底线力量型友好。"),
    ("dunlop-cx-200-tour-16x19-2024", "Dunlop CX 200 Tour 16x19 - 2024", "Dunlop", "CX", "high",
     [("allCourt",5),("flat",4),("aggressiveBaseline",4)], ["advanced","pro"],
     (2,5,5), (4,2,2,2,5,3), "CX 200 Tour 重头窄拍面控制版，巡回级稳定，纯控制高手向。"),
]

def main():
    cur = json.load(open("data/rackets.json"))
    have = {r["id"] for r in cur}
    added = 0
    for e in CURATED:
        rec, miss = build(e)
        if miss:
            print(f"✗ 未匹配: {miss}"); continue
        if rec["id"] in have:
            print(f"· 跳过已存在: {rec['id']}"); continue
        cur.append(rec); added += 1
        print(f"✓ {rec['meta']['brand']} {rec['meta']['model']} {rec['meta']['year']}")
    json.dump(cur, open("data/rackets.json", "w"), ensure_ascii=False, indent=2)
    print(f"\n新增 {added} 支，库内合计 {len(cur)} 支")

if __name__ == "__main__":
    main()
