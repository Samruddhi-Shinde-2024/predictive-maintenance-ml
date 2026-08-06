# STEP 2 : HANDLE IMBALANCED DATASET (SMOTE)

import pandas as pd
from sklearn.preprocessing import LabelEncoder
from imblearn.over_sampling import SMOTE

# 1 Load Dataset
df = pd.read_csv("predictive_maintenance.csv")

print("\nOriginal Dataset Shape:", df.shape)

# 2 Drop Unnecessary Columns
df = df.drop(columns=["UDI", "Product ID", "Failure Type"])

print("\nColumns after dropping unnecessary ones:")
print(df.columns)

# 3 Encode Categorical Feature
encoder = LabelEncoder()

df["Type"] = encoder.fit_transform(df["Type"])

# L = 0
# M = 1
# H = 2

print("\nEncoded Machine Type:")
print(df["Type"].value_counts())

# 4 Separate Features and Target
X = df.drop("Target", axis=1)
y = df["Target"]

print("\nClass Distribution BEFORE SMOTE:")
print(y.value_counts())

# 5 Apply SMOTE
smote = SMOTE(random_state=42)

X_resampled, y_resampled = smote.fit_resample(X, y)

print("\nClass Distribution AFTER SMOTE:")
print(pd.Series(y_resampled).value_counts())

# 6 Create Balanced Dataset
balanced_df = pd.concat([pd.DataFrame(X_resampled), pd.DataFrame(y_resampled)], axis=1)

# Rename target column
balanced_df = balanced_df.rename(columns={0: "Target"})

# 7 Save New Dataset
balanced_df.to_csv("balanced_dataset.csv", index=False)

print("\nBalanced dataset saved as: balanced_dataset.csv")

print("\nNew Dataset Shape:", balanced_df.shape)