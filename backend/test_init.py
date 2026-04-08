import sys
import torch
import timm

checkpoint = torch.load(r"d:\BioBloom_final\backend\krishiausadh\models\best_model.pt", map_location="cpu")
state_dict = checkpoint.get('model_state', checkpoint)

for model_name in ["efficientnet_b0", "efficientnet_b1", "tf_efficientnet_b0", "mobilevitv2_100", "tf_efficientnet_b0_ns"]:
    try:
        model = timm.create_model(model_name, num_classes=71)
        model.load_state_dict(state_dict)
        print("Success!", model_name)
        break
    except Exception as e:
        pass
