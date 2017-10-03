// g++ -std=c++1y -O3 asdf.cpp && ./a.out

#include <iostream>
#include <chrono>
#include <vector>
using namespace std;

struct vec3i
{
  size_t x, y, z;
};

void ayy() {
  std::vector<vec3i> vec(1000000);
  size_t index = 0;
  for(vec3i& v : vec)
  {
    v.x = index++;
    v.y = index++;
    v.z = index++;
  }
}

void lmao(int jordan) {
  std::vector<vec3i> vec;
  size_t index = 0;
  while (index < 3000000)
  {
    vec.push_back(vec3i{index++, index++, index++});
  }
}

template<typename T, typename... Args>
void time(T fn, Args... args) {
  auto before = std::chrono::high_resolution_clock::now();
  fn(args...);
  auto after = std::chrono::high_resolution_clock::now();
  auto microseconds = std::chrono::duration_cast<std::chrono::microseconds>(after - before);
  cout << microseconds.count() << endl;
}

int main() {
  time(&ayy);
  time(&lmao, 1337);
  return 0;
}
