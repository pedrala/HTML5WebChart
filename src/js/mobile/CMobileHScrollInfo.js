export default function CMobileHScrollInfo() {

    this.m_nTouchType = 0; //0:nothing, 1:scroll, 2:Magnify

    this.m_PrevVelocity = null;
    this.m_LastVelocity = null;
    this.m_Acceleration = null;

    this.m_TouchStartX = null;

    this.m_StartX = null;
    this.m_StartTime = null;

    this.m_NextX = null;
    this.m_NextTime = null;

    this.m_IntervalTime = null;
    this.m_MovePixel = null; //터치 이동 거리
    this.m_nMoveScroll = null; //터치 Move로 인해 스크롤된 거리(터치는 이동했지만 스크롤은 되지 않을 수 있다)

    this.m_PrevDirectX = 0; //0:멈춤, 1:왼쪽에서 오른쪽, -1:오른쪽에서 왼쪽
    this.m_LastDirectX = 0; //0:멈춤, 1:왼쪽에서 오른쪽, -1:오른쪽에서 왼쪽

    this.m_FirstTouchID = null;
    this.m_FirstTouchX = null;
    this.m_FirstNextTouchX = null;

    this.m_SecondTouchID = null;
    this.m_SecondTouchX = null;
    this.m_SecondNextTouchX = null;
};
CMobileHScrollInfo.prototype.InitScroll = function () {

    this.m_nTouchType = 0;

    this.m_PrevVelocity = null;
    this.m_LastVelocity = null;
    this.m_Acceleration = null;

    this.m_TouchStartX = null;

    this.m_StartX = null;
    this.m_StartTime = null;

    this.m_NextX = null;
    this.m_NextTime = null;

    this.m_IntervalTime = null;
    this.m_MovePixel = null;
    this.m_nMoveScroll = null;

    ///////////////////////////////
    this.m_FirstTouchID = null;
    this.m_FirstTouchX = null;
    this.m_FirstNextTouchX = null;

    this.m_SecondTouchID = null;
    this.m_SecondTouchX = null;
    this.m_SecondNextTouchX = null;
};
CMobileHScrollInfo.prototype.SetTouchType = function (nTouchType) {
    this.m_nTouchType = nTouchType;
}
CMobileHScrollInfo.prototype.GetTouchType = function () {
    return this.m_nTouchType;
}
CMobileHScrollInfo.prototype.SetTouchStartX = function (TouchStartX) {
    this.m_TouchStartX = TouchStartX;
}
CMobileHScrollInfo.prototype.GetTouchStartX = function () {
    return this.m_TouchStartX;
}
CMobileHScrollInfo.prototype.SetMoveScroll = function (nMoveScroll) {
    this.m_nMoveScroll = nMoveScroll;
}
CMobileHScrollInfo.prototype.GetMoveScroll = function () {
    return this.m_nMoveScroll;
}

CMobileHScrollInfo.prototype.SetStartInfo = function (StartTime, StartX) {
    this.m_StartTime = StartTime;
    this.m_StartX = StartX;
};
CMobileHScrollInfo.prototype.SetNextInfo = function (NextTime, NextX) {
    this.m_NextTime = NextTime;
    this.m_NextX = NextX;
}
CMobileHScrollInfo.prototype.CalcVelocity = function () {
    if (this.m_LastVelocity) {
        this.m_PrevVelocity = this.m_LastVelocity;
        this.m_PrevDirectX = this.m_LastDirectX;
    }

    this.m_LastVelocity = Math.abs(this.m_NextX - this.m_StartX) / (this.m_NextTime - this.m_StartTime);
    this.m_LastDirectX = (this.m_NextX > this.m_StartX ? 1 : (this.m_NextX == this.m_StartX ? 0 : -1));

}
CMobileHScrollInfo.prototype.CalcAcceleration = function () {
    if (!this.m_PrevVelocity)
        return;

    this.m_Acceleration = (this.m_LastVelocity - this.m_PrevVelocity) / (this.m_NextTime - this.m_StartTime);
}
CMobileHScrollInfo.prototype.Calc = function () {
    this.CalcVelocity();
    this.CalcAcceleration();

    this.m_IntervalTime = this.m_NextTime - this.m_StartTime;
    this.m_MovePixel = Math.abs(this.m_NextX - this.m_StartX);
}
CMobileHScrollInfo.prototype.SetFirstTouch = function (FirstTouchID, FirstTouchX) {
    if (this.m_FirstTouchID != null) {

        if (this.m_FirstTouchID == FirstTouchID) {
            if (!this.m_FirstNextTouchX)
                this.m_FirstNextTouchX = FirstTouchX;
            else {
                this.m_FirstTouchX = this.m_FirstNextTouchX;
                this.m_FirstNextTouchX = FirstTouchX;
            }
        }
    } else {
        this.m_FirstTouchID = FirstTouchID;
        this.m_FirstTouchX = FirstTouchX;
        this.m_FirstNextTouchX = null;
    }
}
CMobileHScrollInfo.prototype.SetSecondTouch = function (SecondTouchID, SecondTouchX) {
    if (this.m_SecondTouchID) {

        if (this.m_SecondTouchID == SecondTouchID) {
            if (!this.m_SecondNextTouchX)
                this.m_SecondNextTouchX = SecondTouchX;
            else {
                this.m_SecondTouchX = this.m_SecondNextTouchX;
                this.m_SecondNextTouchX = SecondTouchX;
            }
        }
    } else {
        this.m_SecondTouchID = SecondTouchID;
        this.m_SecondTouchX = SecondTouchX;
        this.m_SecondNextTouchX = null;
    }
}