# STEP 4 : DATA NORMALIZATION

import pandas as pd
from sklearn.preprocessing import StandardScaler

# Load Balanced Dataset
df = pd.read_csv("balanced_dataset.csv")

print("\nBalanced Dataset Shape:", df.shape)

# Separate Features and Target
X = df.drop("Target", axis=1)
y = df["Target"]

print("\nFeatures:")
print(X.columns)

# Apply Standard Normalization
scaler = StandardScaler()

X_scaled = scaler.fit_transform(X)

# Convert back to dataframe
X_scaled = pd.DataFrame(X_scaled, columns=X.columns)

# Combine with Target
normalized_df = pd.concat([X_scaled, y], axis=1)

# Save Normalized Dataset
normalized_df.to_csv("normalized_dataset.csv", index=False)

print("\nNormalized dataset saved as: normalized_dataset.csv")

print("\nNormalized Dataset Shape:", normalized_df.shape)

print("\nFirst 5 rows of normalized dataset:")
print(normalized_df.head())