
# TiledMap

类 `TiledMapProxy`  


### 作用

当前主要用作坐标转换

- `pixelToTileCoords` 地图像素坐标转瓦片坐标 
- `worldToTileCoords` 世界坐标转瓦片坐标 
- `tileToPixelCoords` 瓦片坐标转地图像素坐标
- `tileToWorldCoords` 瓦片坐标转世界坐标
- `tileCoordsToIndex` 瓦片坐标转数据索引
- `indexToTileCoords` 数据索引转瓦片坐标
- `queryFloodFillRegion` 查询洪水填充区域
- `performFloodFillRegion` 执行洪水填充处理


> 具体使用可以查看 `TiledMapOrientationDemo.scene`， 脚本同名。
> 洪水填充处理可以查看 `FloodFillDemo.scene`，脚本同名。