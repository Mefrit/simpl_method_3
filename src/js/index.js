window.onload = function() {
    let start_config = {
        a: 1,
        b: 1,
        g: 1,
        d: 1,
        start_segment: -2,
        end_segment: 2,
        min: -2,
        max: 2,
        upper_limit: 2,
        down_limit: 0,
        numb_splits: 40,
        scale_parametrs: 0.01,
        accuracy_rynge: 0.001,
        curent_parameter: "g",
    };
    let canvas = document.getElementById("canvas");
    let obj = new NumericalMetods(canvas, start_config);
    canvas.onclick = obj.setPosition;

    function startMetod(event) {
        obj.start();
    }

    function UpdateData(event) {
        console.log(event.target.getAttribute("data-type"), event.target.value);
        obj.updateConstants(event.target.getAttribute("data-type"), event.target.value);
    }
    startMetod();

    let inputs = Array.prototype.slice.call(document.getElementsByClassName("parameters__inputs"));

    inputs.forEach((elem) => {
        elem.oninput = UpdateData;
    });
    var checkboxes;

    checkboxes = Array.prototype.slice.call(document.getElementsByClassName("parameters_checkbox"));

    checkboxes.forEach((elem) => {
        elem.onchange = UpdateData;
    });
};

class NumericalMetods {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.a = config.a;
        this.b = config.b;
        this.g = config.g;
        this.d = config.d;
        this.min = config.min;
        this.max = config.max;
        this.step_integral = (config.upper_limit - config.down_limit) / config.numb_splits;
        this.curent_parameter = config.curent_parameter;
        this.start_segment = config.start_segment;
        this.end_segment = config.end_segment;
        this.numb_splits = config.numb_splits;
        this.scale_parametrs = config.scale_parametrs;
        this.upper_limit = config.upper_limit;
        this.down_limit = config.down_limit;
        this.clear = false;
        this.accuracy_rynge = config.accuracy_rynge;
        this.ready = false;
        this.start_x = 1;
        this.start_y = 2;

    }
    setPosition = (e) => {
        console.log(event.screenX, "-", this.canvas.width, "|", event.screenY, "-", this.canvas.height);
        let x, y;
        let bbox = this.canvas.getBoundingClientRect()
        x = e.clientX - bbox.left * (this.canvas.width / bbox.width);
        y = e.clientY - bbox.top * (this.canvas.height / bbox.height);
        this.start_x = (x - bbox.width / 2) + 20;
        this.start_y = (y - bbox.height / 2);
        // if (this.canvas.height / 2 > event.screenY) {
        //     this.start_y = this.canvas.height - event.screenY;
        // } else {
        //     this.start_y = event.screenY - this.canvas.height / 2;
        // }

        console.log("this.start_x, this.start_y =>", this.start_x, this.start_y, "\n\n", "height", this.canvas.height / 2, "screenY", event.screenY);
        this.startСomputing().then(() => {
            document.getElementById("status").style.display = "none";
        });
        // if(event.screenX > this.canvas.width){
        //     this.start_x = event.screenX - 
        // } else{

        // }
        // if(event.screenX > this.canvas.width){

        // } else{

        // }

    }
    getFunction(x, y) {
        let result = { x: 0, y: 0 };
        result.x = 1 * x + 1 * y + 1 * y * x + 1;
        result.y = 1 * x + 1 * y + 1 * y * y * y + 1;
        // result.x = 1 * x + 1 * y;
        // result.y = (1 * x - 1) * (y + x);
        // if (this.g != x) {
        //     return this.a * Math.sin(this.b / Math.pow(x - this.g, 2)) * Math.cos(this.d * x);
        // } else {
        //     return 1;
        // }
        // console.log("result", result, x, y);
        return result;
    }

    updateConstants(kind, value) {
        let dp = 1,
            error = false;

        if (isNaN(parseFloat(value))) {
            if (typeof value == "string" && kind == "curent_parameter") {
                this[kind] = value;
            } else {
                this[kind] = 1;
            }
        } else {
            if (kind == "aproximation") {
                dp = 1;
            }

            if (kind == "min" && parseFloat(value) > this.max) {
                console.log("Error Min > Max");
                error = true;
            }
            if (kind == "max" && parseFloat(value) < this.min) {
                console.log("Error Max > Min");
                error = true;
            }
            if (kind == "start_segment" && parseFloat(value) > this.end_segment) {
                console.log("Error start  > end_segment segment");
                error = true;
            }
            if (kind == "end_segment" && parseFloat(value) < this.start_segment) {
                console.log("Error end_segment < start_segment");
                error = true;
            }
            if (!error) {
                this.clear = true;
                document.getElementById("status").style.display = "block";
                this[kind] = parseFloat(value);
            }
            console.log(kind, parseFloat(value));
        }
        this.ready = false;
        this.start();
    }
    drawArea() {
        let ctx = this.ctx,
            step = this.canvas.width / (this.end_segment - this.start_segment);
        ctx.beginPath();
        ctx.strokeStyle = "gray";
        ctx.lineWidth = 0.3;

        for (let i = step; i < this.canvas.width; i += step) {
            ctx.moveTo(0, i);
            ctx.lineTo(this.canvas.width, i);
            ctx.moveTo(i, 0);
            ctx.lineTo(i, this.canvas.height);
        }
        ctx.moveTo(0, 0);

        ctx.stroke();
        ctx.closePath();
    }

    countingIntergral(n = 1) {
        let arg,
            res = 0;

        for (let i = this.down_limit; i < this.upper_limit; i += this.step_integral / n) {
            // применяется метод прямоугольников
            arg = (i + i + this.step_integral) / 2;
            res += this.getFunction(arg);
        }
        return (this.step_integral / n) * res;
    }
    drawResult(list, color = "black") {
        let scaleX = this.canvas.width / (this.end_segment - this.start_segment),
            scaleY = this.canvas.height / (this.max - this.min);
        this.ctx.lineWidth = 0.6;
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.moveTo(this.canvas.width / 2 + this.start_x, this.canvas.height / 2 + this.start_y);
        list.forEach(elem => {
            // console.log(elem);
            this.ctx.lineTo(elem.x * scaleX, elem.y * scaleY);
            // this.ctx.stroke();
        });

        this.ctx.stroke();
        this.ctx.closePath();

        //     this.ctx.beginPath();
        //     this.ctx.fillRect(
        //         Math.round(-this.start_segment * scaleX + i * scaleX),
        //         Math.round(this.max * scaleY - result_intergral * scaleY),
        //         this.scale_parametrs == 1 ? 4 : 1,
        //         this.scale_parametrs == 1 ? 4 : 1
        //     );
        //     this.ctx.stroke();
        //     this.ctx.closePath();
    }
    checkParametr(par) {
        if (par < 0) {
            return par > -10000 ? par : -10000;
        } else {
            return par > 10000 ? 10000 : par;
        }

    }
    startСomputing(n) {
        return new Promise((resolve) => {
            let checkLoad = () => {
                if (this.ready) {
                    resolve();
                } else {
                    setTimeout(checkLoad, 120);
                }
            };
            checkLoad();
            let curent_x = this.start_x,
                curent_y = this.start_y, // начальные условия системы ( куда тыкаем н а канвасе )
                n = 5,
                res,
                list = [],
                x,
                y;
            this.scale_parametrs = 0.1; // шаг перехода
            for (let i = 0; i < n; i++) {
                res = this.getFunction(curent_x, curent_y);
                curent_x = curent_x - this.scale_parametrs * res.x;
                curent_y = curent_y - this.scale_parametrs * res.y;

                curent_x = this.checkParametr(curent_x);
                curent_y = this.checkParametr(curent_y);
                list.push({ x: curent_x, y: curent_y });
            }
            this.drawResult(list, "green");
            curent_x = this.start_x;
            curent_y = this.start_y;
            console.log("list 1", list);
            list = [];

            for (let i = 0; i < n; i++) {
                res = this.getFunction(curent_x, curent_y);
                curent_x = curent_x + this.scale_parametrs * res.x;
                curent_y = curent_y + this.scale_parametrs * res.y;

                curent_x = this.checkParametr(curent_x);
                curent_y = this.checkParametr(curent_y);
                list.push({ x: curent_x, y: curent_y });
            }



            console.log("list 2", list);
            this.drawResult(list, "red");
            // let result_1 = 0,
            //     result_2 = 2,
            //     coef_step = 1,
            //     j = 0;
            // for (let i = this.start_segment; i < this.end_segment; i += this.scale_parametrs) {
            // if (i != 0) {
            //     this[this.curent_parameter] = i;
            //     j = 0;
            //     coef_step = 1;
            //     // while (true) {
            //     //     j++;
            //     //     result_1 = this.countingIntergral(coef_step);
            //     //     result_2 = this.countingIntergral(coef_step * 2);
            //     //     coef_step *= 2;
            //     //     if (j == 10 || Math.abs(result_2 - result_1) < this.accuracy_rynge) {
            //     //         j = 0;
            //     //         break;
            //     //     }
            //     // }
            //     this.drawResult(result_1, i);
            // }
            // }
            this[this.curent_parameter] = 1;
            this.ready = true;
        });
    }
    start() {
        this.step_integral = (this.upper_limit - this.down_limit) / this.numb_splits;

        document.getElementById("status").style.display = "block";
        setTimeout(() => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawArea();
            console.log("start()");
            this.startСomputing().then(() => {
                document.getElementById("status").style.display = "none";
            });
        }, 100);
    }
}