import type { Topic } from './types'

export const dsa: Topic = {
  id: 'dsa',
  title: 'DSA Patterns',
  group: 'Interview rounds',
  summary:
    'The patterns behind most coding-round problems, each with a classic example in JavaScript: two pointers, sliding window, hashing, stacks, trees, graphs, heaps and intro DP. Practise daily alongside everything else.',
  questions: [
    {
      q: 'How should you approach a coding problem in an interview?',
      level: 'basic',
      a: "- Repeat the problem in your own words and ask about edge cases (empty input, duplicates, negatives, size limits).\n- Work through a small example by hand.\n- Say the brute-force solution and its complexity first.\n- Look for the pattern that improves it (hash map, two pointers, sorting...).\n- Code it cleanly, talking as you go.\n- Test with your example and edge cases, and state the final time and space complexity.",
    },
    {
      q: 'Two Sum: find two numbers that add up to a target.',
      level: 'basic',
      a: "Pattern: hash map. For each number, check whether its complement (`target - n`) was already seen. One pass, O(n) time, O(n) space, instead of O(n²) with nested loops.",
      code: `
function twoSum(nums, target) {
  const seen = new Map() // value -> index
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i]
    if (seen.has(need)) return [seen.get(need), i]
    seen.set(nums[i], i)
  }
  return []
}
twoSum([2, 7, 11, 15], 9) // [0, 1]
`,
    },
    {
      q: 'Two pointers: check whether a string is a palindrome.',
      level: 'basic',
      a: "Pattern: two pointers moving towards each other from both ends. O(n) time, O(1) space. The same pattern solves 'pair with target sum in a sorted array' and 'container with most water'.",
      code: `
function isPalindrome(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '')
  let l = 0, r = clean.length - 1
  while (l < r) {
    if (clean[l] !== clean[r]) return false
    l++; r--
  }
  return true
}
isPalindrome('A man, a plan, a canal: Panama') // true
`,
    },
    {
      q: 'Sliding window: longest substring without repeating characters.',
      level: 'mid',
      diagram: `
flowchart LR
  A["[a b c] a b c b b: len 3"] --> B["a [b c a] b c b b"] --> C["a b [c a b] c b b"] --> D["best = 3"]
`,
      a: "Pattern: a window `[left, right]` that grows to the right and shrinks from the left when it becomes invalid. Track what's inside with a map or set. O(n).",
      code: `
function lengthOfLongestSubstring(s) {
  const lastSeen = new Map()
  let left = 0, best = 0
  for (let right = 0; right < s.length; right++) {
    const ch = s[right]
    if (lastSeen.has(ch) && lastSeen.get(ch) >= left) left = lastSeen.get(ch) + 1
    lastSeen.set(ch, right)
    best = Math.max(best, right - left + 1)
  }
  return best
}
lengthOfLongestSubstring('abcabcbb') // 3 ('abc')
`,
    },
    {
      q: 'Group anagrams.',
      level: 'mid',
      a: "Pattern: hashing with a computed key. Anagrams share the same sorted letters, so use that as the map key. O(n · k log k) where k is word length.",
      code: `
function groupAnagrams(words) {
  const groups = new Map()
  for (const w of words) {
    const key = [...w].sort().join('')
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(w)
  }
  return [...groups.values()]
}
groupAnagrams(['eat', 'tea', 'tan', 'ate', 'nat', 'bat'])
// [['eat','tea','ate'], ['tan','nat'], ['bat']]
`,
    },
    {
      q: 'Valid parentheses.',
      level: 'basic',
      a: "Pattern: stack. Push opening brackets; on a closing bracket, the top of the stack must be its match. The string is valid if the stack is empty at the end. O(n).",
      code: `
function isValid(s) {
  const pairs = { ')': '(', ']': '[', '}': '{' }
  const stack = []
  for (const ch of s) {
    if (ch in pairs) {
      if (stack.pop() !== pairs[ch]) return false
    } else {
      stack.push(ch)
    }
  }
  return stack.length === 0
}
isValid('({[]})') // true
isValid('(]')     // false
`,
    },
    {
      q: 'Maximum subarray sum (Kadane’s algorithm).',
      level: 'mid',
      a: "At each position, either extend the previous subarray or start fresh here, whichever is bigger. Track the best seen. O(n) time, O(1) space.",
      code: `
function maxSubArray(nums) {
  let current = nums[0], best = nums[0]
  for (let i = 1; i < nums.length; i++) {
    current = Math.max(nums[i], current + nums[i])
    best = Math.max(best, current)
  }
  return best
}
maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]) // 6 ([4, -1, 2, 1])
`,
    },
    {
      q: 'Reverse a linked list.',
      level: 'basic',
      a: "Walk the list, pointing each node's `next` back to the previous node. Keep three pointers: previous, current and next. O(n) time, O(1) space.",
      code: `
function reverseList(head) {
  let prev = null, curr = head
  while (curr) {
    const next = curr.next
    curr.next = prev
    prev = curr
    curr = next
  }
  return prev
}
`,
    },
    {
      q: 'Detect a cycle in a linked list.',
      level: 'mid',
      a: "Pattern: fast and slow pointers (Floyd's). The fast pointer moves two steps, the slow one step. If there's a cycle, they eventually meet; if fast reaches the end, there's none. O(n) time, O(1) space.",
      code: `
function hasCycle(head) {
  let slow = head, fast = head
  while (fast && fast.next) {
    slow = slow.next
    fast = fast.next.next
    if (slow === fast) return true
  }
  return false
}
`,
    },
    {
      q: 'Binary tree traversals: BFS and DFS.',
      level: 'mid',
      diagram: `
flowchart TD
  A["1"] --> B["2"]
  A --> C["3"]
  B --> D["4"]
  B --> E["5"]
  C --> F["6"]
`,
      a: "- DFS (depth-first) goes deep before wide, using recursion or a stack. Inorder (left, node, right) visits a binary search tree in sorted order.\n- BFS (breadth-first) visits level by level using a queue. Use it for level-order output and shortest paths in unweighted graphs.",
      code: `
function maxDepth(root) {            // DFS
  if (!root) return 0
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right))
}

function levelOrder(root) {          // BFS
  if (!root) return []
  const result = [], queue = [root]
  while (queue.length) {
    const size = queue.length, level = []
    for (let i = 0; i < size; i++) {
      const node = queue.shift()
      level.push(node.val)
      if (node.left) queue.push(node.left)
      if (node.right) queue.push(node.right)
    }
    result.push(level)
  }
  return result
}
`,
    },
    {
      q: 'Validate a binary search tree.',
      level: 'mid',
      a: "Checking only each node against its direct children isn't enough: every node must fit within a range set by all its ancestors. Pass the allowed min and max down the recursion.",
      code: `
function isValidBST(node, min = -Infinity, max = Infinity) {
  if (!node) return true
  if (node.val <= min || node.val >= max) return false
  return isValidBST(node.left, min, node.val) && isValidBST(node.right, node.val, max)
}
`,
    },
    {
      q: 'Number of islands (graph traversal on a grid).',
      level: 'mid',
      a: "Treat the grid as a graph. Loop over every cell; when you find unvisited land, count an island and flood-fill (DFS or BFS) to mark all connected land as visited. O(rows × cols).",
      code: `
function numIslands(grid) {
  let count = 0
  const sink = (r, c) => {
    if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] !== '1') return
    grid[r][c] = '0'
    sink(r + 1, c); sink(r - 1, c); sink(r, c + 1); sink(r, c - 1)
  }
  for (let r = 0; r < grid.length; r++)
    for (let c = 0; c < grid[0].length; c++)
      if (grid[r][c] === '1') { count++; sink(r, c) }
  return count
}
`,
    },
    {
      q: 'Top K frequent elements.',
      level: 'mid',
      a: "Count with a map, then pick the top k. Sorting the counts is O(n log n). Bucket sort by frequency (an array where index = count) gets O(n). A min-heap of size k gives O(n log k).",
      code: `
function topKFrequent(nums, k) {
  const counts = new Map()
  for (const n of nums) counts.set(n, (counts.get(n) || 0) + 1)
  const buckets = Array.from({ length: nums.length + 1 }, () => [])
  for (const [n, c] of counts) buckets[c].push(n)
  const result = []
  for (let c = buckets.length - 1; c >= 0 && result.length < k; c--) result.push(...buckets[c])
  return result.slice(0, k)
}
topKFrequent([1, 1, 1, 2, 2, 3], 2) // [1, 2]
`,
    },
    {
      q: 'Merge overlapping intervals.',
      level: 'mid',
      a: "Sort by start time. Walk through: if the current interval overlaps the last merged one, extend its end; otherwise start a new one. O(n log n). This comes up in real work too, for example merging booked time slots.",
      code: `
function merge(intervals) {
  intervals.sort((a, b) => a[0] - b[0])
  const out = [intervals[0]]
  for (const [start, end] of intervals.slice(1)) {
    const last = out[out.length - 1]
    if (start <= last[1]) last[1] = Math.max(last[1], end)
    else out.push([start, end])
  }
  return out
}
merge([[1, 3], [2, 6], [8, 10], [15, 18]]) // [[1, 6], [8, 10], [15, 18]]
`,
    },
    {
      q: 'Climbing stairs: an introduction to dynamic programming.',
      level: 'basic',
      diagram: `
flowchart TD
  F5["ways(5)"] --> F4["ways(4)"]
  F5 --> F3a["ways(3)"]
  F4 --> F3b["ways(3) again"]
  F4 --> F2a["ways(2)"]
  F3a --> F2b["ways(2) again"]
`,
      a: "Dynamic programming means breaking a problem into overlapping subproblems and storing their answers instead of recomputing them. To reach step n you come from n-1 or n-2, so ways(n) = ways(n-1) + ways(n-2), just like Fibonacci. Naive recursion is O(2ⁿ); keeping the last two values is O(n) time and O(1) space.",
      code: `
function climbStairs(n) {
  let a = 1, b = 1 // ways to reach step 0 and step 1
  for (let i = 2; i <= n; i++) [a, b] = [b, a + b]
  return b
}
climbStairs(5) // 8
`,
    },
    {
      q: 'Coin change: fewest coins to make an amount.',
      level: 'advanced',
      a: "Classic bottom-up DP. `dp[x]` = fewest coins to make x. For each amount, try every coin and take the best `dp[x - coin] + 1`. O(amount × coins).",
      code: `
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity)
  dp[0] = 0
  for (let x = 1; x <= amount; x++)
    for (const c of coins)
      if (c <= x) dp[x] = Math.min(dp[x], dp[x - c] + 1)
  return dp[amount] === Infinity ? -1 : dp[amount]
}
coinChange([1, 2, 5], 11) // 3 (5 + 5 + 1)
`,
    },
    {
      q: 'Which pattern should you reach for? A quick cheat sheet.',
      level: 'basic',
      a: "- 'Find a pair or complement' → hash map.\n- Sorted array, pairs or in-place changes → two pointers.\n- 'Longest or shortest subarray or substring with a condition' → sliding window.\n- Brackets, 'next greater element', undo → stack.\n- Shortest path in an unweighted grid or graph, level order → BFS.\n- All paths, connected regions, trees → DFS or recursion.\n- 'Top k', 'k closest', running median → heap.\n- Sorted input, or 'minimum value that works' → binary search.\n- Counting ways, min or max cost with overlapping choices → dynamic programming.\n- All combinations or permutations → backtracking.",
    },
  ],
}
