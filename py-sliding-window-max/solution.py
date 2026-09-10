def window_max(nums, w):
    if w <= 0 or w > len(nums):
        return []
    out = []
    for i in range(len(nums) - w + 1):
        out.append(max(nums[i:i + w]))
    return out
