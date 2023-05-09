
declare global {

    interface ITNT {
        AnimationType: typeof GAnimationType;
    }
    namespace tnt{
        type AnimationType = GAnimationType;
    }
}

// 动画类型
enum GAnimationType {
    Frame = 1,
    Spine = 2,

}

tnt.AnimationType = GAnimationType;

export { };