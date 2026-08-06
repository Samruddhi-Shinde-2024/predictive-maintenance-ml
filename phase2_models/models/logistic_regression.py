# models/logistic_regression.py

import os
import json
import numpy as np
import pandas as pd
import pickle
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                             f1_score, confusion_matrix, roc_curve, auc)
from sklearn.model_selection import train_test_split

df = pd.read_csv("/Users/shlokbam/Documents/Code/mldl/phase2_models/data/normalized_dataset.csv")

X = df.drop("Target", axis=1)
y = df["Target"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)

results = {
    "Model": "Logistic Regression",
    "Accuracy": accuracy_score(y_test, y_pred),
    "Precision": precision_score(y_test, y_pred),
    "Recall": recall_score(y_test, y_pred),
    "F1 Score": f1_score(y_test, y_pred)
}

# Save model
with open("/Users/shlokbam/Documents/Code/mldl/phase2_models/saved_models/logistic.pkl", "wb") as f:
    pickle.dump(model, f)

# Save results
pd.DataFrame([results]).to_csv("/Users/shlokbam/Documents/Code/mldl/phase2_models/outputs/logistic_results.csv", index=False)

# ── Confusion Matrix ──────────────────────────────────────────────────────────
OUT = "/Users/shlokbam/Documents/Code/mldl/phase2_models/outputs"
MODEL_KEY = "Logistic Regression"

cm = confusion_matrix(y_test, y_pred)
tn, fp, fn, tp = cm.ravel()
grid = [[tn, fp], [fn, tp]]

fig, ax = plt.subplots(figsize=(5, 4))
im = ax.imshow(grid, cmap="Blues")
ax.set_xticks([0, 1]); ax.set_yticks([0, 1])
ax.set_xticklabels(["No Failure", "Failure"])
ax.set_yticklabels(["No Failure", "Failure"])
ax.set_xlabel("Predicted"); ax.set_ylabel("Actual")
ax.set_title(f"Confusion Matrix — {MODEL_KEY}")
for i in range(2):
    for j in range(2):
        ax.text(j, i, str(grid[i][j]), ha="center", va="center", fontsize=13)
plt.colorbar(im); plt.tight_layout()
plt.savefig(f"{OUT}/logistic_confusion_matrix.png", dpi=120)
plt.close()

# ── ROC Curve ─────────────────────────────────────────────────────────────────
y_prob = model.predict_proba(X_test)[:, 1]
fpr, tpr, _ = roc_curve(y_test, y_prob)
roc_auc = auc(fpr, tpr)

plt.figure(figsize=(6, 5))
plt.plot(fpr, tpr, lw=2, label=f"AUC = {roc_auc:.3f}")
plt.plot([0, 1], [0, 1], "k--", lw=1, label="Random Baseline")
plt.xlabel("False Positive Rate"); plt.ylabel("True Positive Rate")
plt.title(f"ROC Curve — {MODEL_KEY}")
plt.legend(); plt.tight_layout()
plt.savefig(f"{OUT}/logistic_roc_curve.png", dpi=120)
plt.close()

# ── Save JSON for website ─────────────────────────────────────────────────────
idx = np.linspace(0, len(fpr) - 1, 100, dtype=int)
eval_path = f"{OUT}/model_evaluation.json"
eval_data = json.load(open(eval_path)) if os.path.exists(eval_path) else {}
eval_data[MODEL_KEY] = {
    "cm": [int(tn), int(fp), int(fn), int(tp)],
    "fpr": fpr[idx].tolist(),
    "tpr": tpr[idx].tolist(),
    "auc": round(float(roc_auc), 4)
}
json.dump(eval_data, open(eval_path, "w"), indent=2)

print("Logistic Regression Done — CM + ROC saved.")