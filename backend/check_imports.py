
try:
    import torch
    print("Torch imported successfully.")
    import torchvision
    print("Torchvision imported successfully.")
    import facenet_pytorch
    print("Facenet-pytorch imported successfully.")
    import cv2
    print("OpenCV imported successfully.")
except Exception as e:
    print(f"Error: {e}")
