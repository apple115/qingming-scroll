from PIL import Image
import os
from PIL import ImageFile

# 避免大图像的限制警告
Image.MAX_IMAGE_PIXELS = None
ImageFile.LOAD_TRUNCATED_IMAGES = True

# 载入图像
img = Image.open('qingming.jpg')

# 图像块大小
tile_size = 512

# 获取图像尺寸
width, height = img.size

# 创建保存图像块的目录
output_dir = 'tiles'
os.makedirs(output_dir, exist_ok=True)

# 切割图像
for row in range(0, height, tile_size):
    for col in range(0, width, tile_size):
        box = (col, row, col + tile_size, row + tile_size)
        tile = img.crop(box)
        tile.save(os.path.join(output_dir, f'{row // tile_size}-{col // tile_size}.jpg'))

print('图像切割完成！')
