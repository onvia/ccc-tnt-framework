import { js } from "cc";


export const _js = {

    hasSuper(clazz: GConstructor<any>, _super: GConstructor<any>): GConstructor {
        let superClass = js.getSuper(clazz);
        while (superClass != null) {
            if (superClass == _super) {
                break;
            }
            superClass = js.getSuper(superClass);
        }
        return superClass;
    },
}


type __JS = typeof _js;

declare global {
    interface _JS extends __JS {

    }
    interface ITNT {
        js: _JS;
    }
}
tnt.js = _js;