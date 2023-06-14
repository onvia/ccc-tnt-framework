import { CaptureScene } from "./assets/bundles/capture-example/scripts/CaptureScene"
import { DragDropScene } from "./assets/bundles/drag-drop-example/DragDropScene"
import { MainScene } from "./assets/bundles/main-scene/scripts/scene/MainScene"
import { DemoVMLabelFormat } from "./assets/bundles/mvvm-example/scripts/DemoVMLabelFormat"
import { DemoVMNormal } from "./assets/bundles/mvvm-example/scripts/DemoVMNormal"
import { WindowScene } from "./assets/bundles/window-example/scripts/WindowScene"

declare global {
	interface CaptureSceneOptions{}
	interface DragDropSceneOptions{}
	interface MainSceneOptions{}
	interface DemoVMLabelFormatOptions{}
	interface MVVMSceneOptions{}
	interface WindowSceneOptions{}

	interface GlobalSceneType{
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
		"DemoVMLabelFormat": {
			ctor: DemoVMLabelFormat,
			options: DemoVMLabelFormatOptions,
		}
		"MVVMScene": {
			ctor: DemoVMNormal,
			options: MVVMSceneOptions,
		}
		"WindowScene": {
			ctor: WindowScene,
			options: WindowSceneOptions,
		}
	}
}