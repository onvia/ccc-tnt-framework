import { MainScene } from "./assets/scripts/scene/MainScene"
import { WindowScene } from "./assets/window-example/scripts/WindowScene"

declare global {
	interface MainSceneOptions{}
	interface WindowSceneOptions{}

	interface GlobalSceneType{
		"MainScene": {
			ctor: MainScene,
			options: MainSceneOptions,
		}
		"WindowScene": {
			ctor: WindowScene,
			options: WindowSceneOptions,
		}
	}
}