import sys, json

data = json.load(sys.stdin)

code = data["code"]
test_case = data["testCase"]

local_vars = {}

try:
    exec(code, {}, local_vars)
    result = local_vars["solve"](test_case)
    print(result)
except Exception as e:
    print("ERROR:", e)