import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os

# Create folder for graphs
os.makedirs("eda_graphs", exist_ok=True)

df = pd.read_csv("predictive_maintenance.csv")

print("\nDataset Shape:", df.shape)
print("\nMissing Values:\n", df.isnull().sum())
print("\nClass Distribution:\n", df['Target'].value_counts())


# Class Distribution
plt.figure(figsize=(6,4))
sns.countplot(x='Target', data=df)
plt.title("Class Distribution")
plt.savefig("eda_graphs/class_distribution.png")
plt.close()

# Failure Type
plt.figure(figsize=(8,5))
sns.countplot(x='Failure Type', data=df)
plt.xticks(rotation=45)
plt.title("Failure Type Distribution")
plt.savefig("eda_graphs/failure_type.png")
plt.close()

# Correlation Heatmap
numeric_df = df.select_dtypes(include=np.number)

plt.figure(figsize=(10,6))
sns.heatmap(numeric_df.corr(), annot=True, cmap="coolwarm")
plt.title("Correlation Heatmap")
plt.savefig("eda_graphs/correlation_heatmap.png")
plt.close()

# Feature Distributions
features = [
    'Air temperature [K]',
    'Process temperature [K]',
    'Rotational speed [rpm]',
    'Torque [Nm]',
    'Tool wear [min]'
]

for feature in features:
    plt.figure()
    sns.histplot(df[feature], kde=True)
    plt.title(feature)
    plt.savefig(f"eda_graphs/{feature}_distribution.png")
    plt.close()

# Boxplots
for feature in features:
    plt.figure()
    sns.boxplot(x=df[feature])
    plt.title(f"{feature} Outliers")
    plt.savefig(f"eda_graphs/{feature}_boxplot.png")
    plt.close()

print("\nEDA Completed. Graphs saved in 'eda_graphs' folder.")