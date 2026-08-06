
# STEP 5 : EDA ON NORMALIZED DATASET

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os

# Create folder for graphs
os.makedirs("normalized_eda_graphs", exist_ok=True)

# Load normalized dataset
df = pd.read_csv("normalized_dataset.csv")

print("\n===================================")
print("NORMALIZED DATASET INFORMATION")
print("===================================")

# Dataset Shape
print("\nDataset Shape:")
print(df.shape)

# First rows
print("\nFirst 5 Rows:")
print(df.head())

# Data Types
print("\nData Types:")
print(df.dtypes)

# Missing Values
print("\nMissing Values:")
print(df.isnull().sum())

# Statistical Summary
print("\nStatistical Summary:")
print(df.describe())

# Class Distribution
print("\nClass Distribution:")
print(df["Target"].value_counts())

plt.figure(figsize=(6,4))
sns.countplot(x="Target", data=df)
plt.title("Class Distribution (Normalized Dataset)")
plt.savefig("normalized_eda_graphs/class_distribution.png")
plt.close()

# Feature Distributions
features = df.drop("Target", axis=1).columns

for feature in features:

    plt.figure(figsize=(6,4))
    sns.histplot(df[feature], kde=True)
    plt.title(f"{feature} Distribution (Normalized)")
    plt.savefig(f"normalized_eda_graphs/{feature}_distribution.png")
    plt.close()

# Correlation Heatmap
plt.figure(figsize=(10,6))
sns.heatmap(df.corr(), annot=True, cmap="coolwarm")
plt.title("Correlation Heatmap (Normalized Dataset)")
plt.savefig("normalized_eda_graphs/correlation_heatmap.png")
plt.close()

# Boxplots for Outliers
for feature in features:

    plt.figure(figsize=(6,4))
    sns.boxplot(x=df[feature])
    plt.title(f"{feature} Boxplot (Normalized)")
    plt.savefig(f"normalized_eda_graphs/{feature}_boxplot.png")
    plt.close()

print("\nEDA on Normalized Dataset Completed")
print("Graphs saved in 'normalized_eda_graphs' folder")