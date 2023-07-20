import { CameraShakeDemo } from "./assets/bundles/camera-controls/scripts/CameraShakeDemo"
import { CaptureScene } from "./assets/bundles/capture-example/scripts/CaptureScene"
import { DragDropScene } from "./assets/bundles/drag-drop-example/DragDropScene"
import { MainScene } from "./assets/bundles/main-scene/scripts/scene/MainScene"
import { DemoVMBindUnBind } from "./assets/bundles/mvvm-example/scripts/DemoVMBindUnBind"
import { DemoVMLabelFormat } from "./assets/bundles/mvvm-example/scripts/DemoVMLabelFormat"
import { DemoVMNormal } from "./assets/bundles/mvvm-example/scripts/DemoVMNormal"
import { DemoVMProgress } from "./assets/bundles/mvvm-example/scripts/DemoVMProgress"
import { DemoVMSprite } from "./assets/bundles/mvvm-example/scripts/DemoVMSprite"
import { MVVMDemoList } from "./assets/bundles/mvvm-example/scripts/MVVMDemoList"
import { RedPointDemo } from "./assets/bundles/red-point-example/scripts/RedPointDemo"
import { RVO2Scene } from "./assets/bundles/rvo2-example/scripts/RVO2Scene"
import { BaseDemo } from "./assets/bundles/test-example/scripts/BaseDemo"
import { LongPressDemo } from "./assets/bundles/test-example/scripts/LongPressDemo"
import { TiledMapOrientationDemo } from "./assets/bundles/tiled-map-example/scripts/TiledMapOrientationDemo"
import { WindowScene } from "./assets/bundles/window-example/scripts/WindowScene"

declare global {
	interface CameraShakeDemoOptions{}
	interface CaptureSceneOptions{}
	interface DragDropSceneOptions{}
	interface MainSceneOptions{}
	interface DemoVMBindUnBindOptions{}
	interface DemoVMLabelFormatOptions{}
	interface DemoVMNormalOptions{}
	interface DemoVMProgressOptions{}
	interface DemoVMSpriteOptions{}
	interface MVVMDemoListOptions{}
	interface RedPointDemoOptions{}
	interface RVO2SceneOptions{}
	interface BaseDemoOptions{}
	interface LongPressDemoOptions{}
	interface TiledMapOrientationDemoOptions{}
	interface WindowSceneOptions{}

	interface GlobalSceneType{
		"CameraShakeDemo": {
			ctor: CameraShakeDemo,
			options: CameraShakeDemoOptions,
		}
		"CaptureScene": {
			ctor: CaptureScene,
			options: CaptureSceneOptions,
		}
		"DragDropScene": {
			ctor: DragDropScene,
			options: DragDropSceneOptions,
		}
		"MainScene": {
			ctor: MainScene,
			options: MainSceneOptions,
		}
		"DemoVMBindUnBind": {
			ctor: DemoVMBindUnBind,
			options: DemoVMBindUnBindOptions,
		}
		"DemoVMLabelFormat": {
			ctor: DemoVMLabelFormat,
			options: DemoVMLabelFormatOptions,
		}
		"DemoVMNormal": {
			ctor: DemoVMNormal,
			options: DemoVMNormalOptions,
		}
		"DemoVMProgress": {
			ctor: DemoVMProgress,
			options: DemoVMProgressOptions,
		}
		"DemoVMSprite": {
			ctor: DemoVMSprite,
			options: DemoVMSpriteOptions,
		}
		"MVVMDemoList": {
			ctor: MVVMDemoList,
			options: MVVMDemoListOptions,
		}
		"RedPointDemo": {
			ctor: RedPointDemo,
			options: RedPointDemoOptions,
		}
		"RVO2Scene": {
			ctor: RVO2Scene,
			options: RVO2SceneOptions,
		}
		"BaseDemo": {
			ctor: BaseDemo,
			options: BaseDemoOptions,
		}
		"LongPressDemo": {
			ctor: LongPressDemo,
			options: LongPressDemoOptions,
		}
		"TiledMapOrientationDemo": {
			ctor: TiledMapOrientationDemo,
			options: TiledMapOrientationDemoOptions,
		}
		"WindowScene": {
			ctor: WindowScene,
			options: WindowSceneOptions,
		}
	}
}