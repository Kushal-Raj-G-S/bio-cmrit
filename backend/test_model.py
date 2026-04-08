import torch
model = torch.load(r"d:\BioBloom_final\backend\krishiausadh\models\best_model.pt", map_location="cpu")
print("Keys:", list(model.keys())[:10])
for k, v in list(model.items())[:3]:
    print(k, type(v))
