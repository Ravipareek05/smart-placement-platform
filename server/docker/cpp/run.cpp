#include <bits/stdc++.h>
using namespace std;

int main() {
    vector<int> a;
    int x;
    while (cin >> x) a.push_back(x);

    int sum = 0;
    for (int v : a) sum += v;

    cout << sum;
    return 0;
}