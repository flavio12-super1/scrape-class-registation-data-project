import os
import json 
import pandas as pd 
import tkinter as tk

# just manually change the data 
# will make this with a ui and editable paths later
with open('data.json', 'r') as json_file:
    data = json.load(json_file)
    for item in data["data"]: 
        before = item["subjectDescription"]
        item["subjectDescription"] = "Computer Science and Engineering" 
        after = item["subjectDescription"]
        print(f"Before: {before} | After: {after}")

with open('data.json', 'w') as json_file:
    json.dump(data, json_file, indent=4)