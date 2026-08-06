# STEP 3 : EDA ON BALANCED DATASET

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os

# Create folder for graphs
os.makedirs("balanced_eda_graphs", exist_ok=True)

# Load balanced dataset
df = pd.read_csv("balanced_dataset.csv")

print("\n==============================")
print("BALANCED DATASET INFORMATION")
print("==============================")

print("\nDataset Shape:")
print(df.shape)

print("\nFirst 5 Rows:")
print(df.head())

print("\nData Types:")
print(df.dtypes)

print("\nMissing Values:")
print(df.isnull().sum())

print("\nStatistical Summary:")
print(df.describe())

# Class Distribution
print("\nClass Distribution:")
print(df["Target"].value_counts())

plt.figure(figsize=(6,4))
sns.countplot(x="Target", data=df)
plt.title("Balanced Class Distribution")
plt.savefig("balanced_eda_graphs/balanced_class_distribution.png")
plt.close()

# Feature Distribution
features = df.drop("Target", axis=1).columns

for feature in features:
    
    plt.figure(figsize=(6,4))
    sns.histplot(df[feature], kde=True)
    plt.title(f"{feature} Distribution")
    plt.savefig(f"balanced_eda_graphs/{feature}_distribution.png")
    plt.close()

# Correlation Heatmap
plt.figure(figsize=(10,6))
sns.heatmap(df.corr(), annot=True, cmap="coolwarm")
plt.title("Balanced Dataset Correlation")
plt.savefig("balanced_eda_graphs/correlation_heatmap.png")
plt.close()

print("\nBalanced Dataset EDA Completed")
print("Graphs saved in 'balanced_eda_graphs' folder")