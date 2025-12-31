import torch.nn as nn
from torchvision import models

class DeepfakeResNet18(nn.Module):
    def __init__(self, num_classes=2, pretrained=True):
        super().__init__()
        # Using weights=None to avoid download errors if internet is restricted, 
        # but user should ideally have weights.
        # Original code used pretrained=True.
        # We will try to use defaults.
        try:
             self.backbone = models.resnet18(weights='IMAGENET1K_V1' if pretrained else None)
        except:
             self.backbone = models.resnet18(pretrained=pretrained)
             
        in_features = self.backbone.fc.in_features
        self.backbone.fc = nn.Linear(in_features, num_classes)

    def forward(self, x):
        return self.backbone(x)
