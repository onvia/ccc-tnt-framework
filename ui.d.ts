import { Dialog } from "./assets/framework/scenes/scene2d/gui/Dialog"
import { AutoCloseWindow } from "./assets/window-example/scripts/AutoCloseWindow"
import { DialogWindow } from "./assets/window-example/scripts/DialogWindow"
import { UIEmbedItem } from "./assets/window-example/scripts/embeds/UIEmbedItem"
import { UIEmbedPanel1 } from "./assets/window-example/scripts/embeds/UIEmbedPanel1"
import { UIEmbedPanel2 } from "./assets/window-example/scripts/embeds/UIEmbedPanel2"
import { UIEmbedPanel3 } from "./assets/window-example/scripts/embeds/UIEmbedPanel3"
import { EmbedWindow } from "./assets/window-example/scripts/EmbedWindow"
import { PauseWindow } from "./assets/window-example/scripts/PauseWindow"
import { TopMenuBar } from "./assets/window-example/scripts/topMenuBar/TopMenuBar"
import { VictoryWindow } from "./assets/window-example/scripts/VictoryWindow"

declare global {
	interface DialogOptions{}
	interface AutoCloseWindowOptions{}
	interface DialogWindowOptions{}
	interface UIEmbedItemOptions{}
	interface UIEmbedPanel1Options{}
	interface UIEmbedPanel2Options{}
	interface UIEmbedPanel3Options{}
	interface EmbedWindowOptions{}
	interface PauseWindowOptions{}
	interface TopMenuBarOptions{}
	interface VictoryWindowOptions{}

	interface GlobalWindowType{
		"Dialog": {
			ctor: Dialog,
			options: DialogOptions,
		}
		"AutoCloseWindow": {
			ctor: AutoCloseWindow,
			options: AutoCloseWindowOptions,
		}
		"DialogWindow": {
			ctor: DialogWindow,
			options: DialogWindowOptions,
		}
		"EmbedWindow": {
			ctor: EmbedWindow,
			options: EmbedWindowOptions,
		}
		"PauseWindow": {
			ctor: PauseWindow,
			options: PauseWindowOptions,
		}
		"VictoryWindow": {
			ctor: VictoryWindow,
			options: VictoryWindowOptions,
		}
	}
	interface GlobalUIType{
		"UIEmbedItem": {
			ctor: UIEmbedItem,
			options: UIEmbedItemOptions,
		}
		"UIEmbedPanel1": {
			ctor: UIEmbedPanel1,
			options: UIEmbedPanel1Options,
		}
		"UIEmbedPanel2": {
			ctor: UIEmbedPanel2,
			options: UIEmbedPanel2Options,
		}
		"UIEmbedPanel3": {
			ctor: UIEmbedPanel3,
			options: UIEmbedPanel3Options,
		}
		"TopMenuBar": {
			ctor: TopMenuBar,
			options: TopMenuBarOptions,
		}
	}
}