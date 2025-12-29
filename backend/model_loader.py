import torch
import torch.nn as nn
import timm
import os

# --- 1. THE EXACT MODEL ARCHITECTURE ---
class DeepFakeModel(nn.Module):
    def __init__(self, cnn_model_name='efficientnet_b0', lstm_hidden=256, lstm_layers=1, num_classes=2, pretrained=False):
        super(DeepFakeModel, self).__init__()
        
        # Frame-level feature extractor
        self.cnn = timm.create_model(cnn_model_name, pretrained=pretrained, num_classes=0)
        self.cnn_out_features = self.cnn.num_features
        
        # Temporal modeling
        self.lstm = nn.LSTM(input_size=self.cnn_out_features, hidden_size=lstm_hidden, 
                            num_layers=lstm_layers, batch_first=True, bidirectional=True)
        
        # Final classifier
        self.classifier = nn.Sequential(
            nn.Linear(lstm_hidden * 2, 128),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(128, num_classes)
        )
    
    def forward(self, x):
        """
        x: [batch_size, seq_len, 3, H, W]
        """
        batch_size, seq_len, C, H, W = x.size()
        
        # Reshape for frame-level CNN
        x = x.view(batch_size * seq_len, C, H, W)
        features = self.cnn(x)
        features = features.view(batch_size, seq_len, -1)
        
        # LSTM for temporal modeling
        lstm_out, _ = self.lstm(features)
        lstm_out = lstm_out[:, -1, :]  # Take last time step
        
        out = self.classifier(lstm_out)
        return out

# --- 2. THE LOADER FUNCTION ---
def load_model(model_path, device):
    print(f"[Model Loader] Loading Custom DeepFakeModel from {model_path}...")
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at: {model_path}")

    # Initialize model structure (pretrained=False for speed/safety)
    model = DeepFakeModel(pretrained=False)
    
    # Load weights
    try:
        state_dict = torch.load(model_path, map_location=device)
        model.load_state_dict(state_dict)
        print("[Model Loader] Weights loaded successfully!")
    except Exception as e:
        print(f"[Model Loader] Error loading weights: {e}")
        raise e
    
    model.to(device)
    model.eval()
    return model
