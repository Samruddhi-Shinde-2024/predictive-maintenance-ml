# evaluation/evaluate_models.py

import pandas as pd
import matplotlib.pyplot as plt
import os

path = "/Users/shlokbam/Documents/Code/mldl/phase2_models/outputs/"

files = [f for f in os.listdir(path) if f.endswith(".csv")]

df_list = []

for file in files:
    df = pd.read_csv(path + file)
    df_list.append(df)

final_df = pd.concat(df_list, ignore_index=True)

# Save combined results
final_df.to_csv("/Users/shlokbam/Documents/Code/mldl/phase2_models/outputs/model_results.csv", index=False)

print("\nFinal Results:\n")
print(final_df)

# Plot comparison
plt.figure(figsize=(8,5))
plt.bar(final_df["Model"], final_df["Accuracy"])
plt.xticks(rotation=45)
plt.title("Model Accuracy Comparison")

plt.savefig("/Users/shlokbam/Documents/Code/mldl/phase2_models/outputs/comparison_graph.png")
plt.show()