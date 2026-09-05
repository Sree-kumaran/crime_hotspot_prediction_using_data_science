import numpy as np
from app.ml.model_loader import get_model, get_metadata


def predict_grid(input_tensor):
    model = get_model()
    metadata = get_metadata()

    y = model.predict(input_tensor, verbose=0)
    y = np.array(y)

    # expected from metadata output_shape [20,20,1]
    if y.ndim == 4:      # (batch, h, w, 1)
        grid = y[0, :, :, 0]
    elif y.ndim == 3:    # (batch, h, w)
        grid = y[0]
    else:
        raise ValueError(f"Unexpected model output shape: {y.shape}")

    expected_hw = tuple(metadata["output_shape"][:2])
    if grid.shape != expected_hw:
        raise ValueError(f"Output shape mismatch. expected={expected_hw}, got={grid.shape}")

    return grid