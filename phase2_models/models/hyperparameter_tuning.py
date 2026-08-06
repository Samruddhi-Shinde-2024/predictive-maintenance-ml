# models/hyperparameter_tuning.py

import pandas as pd
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import accuracy_score

# 1. Load Data
df = pd.read_csv("/Users/shlokbam/Documents/Code/mldl/phase2_models/data/normalized_dataset.csv")
X = df.drop("Target", axis=1)
y = df["Target"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 2. Define Model
model = RandomForestClassifier(random_state=42)

# 3. DEFINE THE GRID (The "Testing Menu")
param_grid = {
    'n_estimators': [50, 100, 200],      # "Trees"
    'max_depth': [5, 8, 10, None],        # "Max Depth"
    'min_samples_split': [2, 5, 10]      # Added an extra RF parameter
}

# 4. Setup GridSearchCV
print("Starting Grid Search for Random Forest...")
grid_search = GridSearchCV(
    estimator=model,
    param_grid=param_grid,
    cv=5,
    scoring='accuracy',
    verbose=2,
    n_jobs=-1
)

# 5. RUN THE SEARCH
grid_search.fit(X_train, y_train)

# 6. RESULTS
print("\n" + "="*30)
print("🏆 WINNING PARAMETERS FOUND:")
print("="*30)
for param, value in grid_search.best_params_.items():
    print(f"{param}: {value}")

# Test the best model
best_model = grid_search.best_estimator_
y_pred = best_model.predict(X_test)
print(f"\nFinal Accuracy of Best Model: {accuracy_score(y_test, y_pred):.4f}")
