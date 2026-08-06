# BEFORE vs AFTER SMOTE ANALYSIS

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os

# Create folder
os.makedirs("smote_comparison_graphs", exist_ok=True)

# Load datasets
original = pd.read_csv("predictive_maintenance.csv")
balanced = pd.read_csv("balanced_dataset.csv")

# Drop unused columns in original
original = original.drop(columns=["UDI", "Product ID", "Failure Type"])

# Encode machine type
original["Type"] = original["Type"].map({"L":0,"M":1,"H":2})

# CLASS DISTRIBUTION COMPARISON
plt.figure(figsize=(10,5))

plt.subplot(1,2,1)
sns.countplot(x="Target", data=original)
plt.title("Before SMOTE")

plt.subplot(1,2,2)
sns.countplot(x="Target", data=balanced)
plt.title("After SMOTE")

plt.savefig("smote_comparison_graphs/class_balance_comparison.png")
plt.close()

# FEATURE DISTRIBUTION COMPARISON

features = [
'Air temperature [K]',
'Process temperature [K]',
'Rotational speed [rpm]',
'Torque [Nm]',
'Tool wear [min]'
]

for feature in features:

    plt.figure(figsize=(10,5))

    plt.subplot(1,2,1)
    sns.histplot(original[feature], kde=True)
    plt.title(f"Before SMOTE - {feature}")

    plt.subplot(1,2,2)
    sns.histplot(balanced[feature], kde=True)
    plt.title(f"After SMOTE - {feature}")

    plt.savefig(f"smote_comparison_graphs/{feature}_comparison.png")
    plt.close()

# CORRELATION COMPARISON

plt.figure(figsize=(10,6))
sns.heatmap(original.corr(), cmap="coolwarm")
plt.title("Correlation Before SMOTE")
plt.savefig("smote_comparison_graphs/correlation_before_smote.png")
plt.close()

plt.figure(figsize=(10,6))
sns.heatmap(balanced.corr(), cmap="coolwarm")
plt.title("Correlation After SMOTE")
plt.savefig("smote_comparison_graphs/correlation_after_smote.png")
plt.close()

print("\nSMOTE Comparison Analysis Completed")
print("Graphs saved in 'smote_comparison_graphs' folder")