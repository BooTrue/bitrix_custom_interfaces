var CustomTasks = BX.namespace('CustomTasks');

CustomTasks.StartCreate = function (parameters){
    var listElement = document.querySelectorAll('.task-detail-sidebar-item-title');
    var startElement = null;
    var finishElement = null;

    for (let element of listElement) {
        if (element.textContent == BX.message('CUSTOM_TASK_DATE_START'))
        {
            startElement = element.parentNode;
            element.parentNode.setAttribute('id', 'start-date');
        }

        if (element.textContent == BX.message('CUSTOM_TASK_DATE_FINISH'))
        {
            finishElement = element.parentNode;
            element.parentNode.setAttribute('id', 'finish-date');
        }

        if (element.textContent == BX.message('CUSTOM_TASK_DATE_STAGED'))
        {
            element.parentNode.setAttribute('id', 'staged-date');
        }
    }

    if (startElement === null)
    {
        var divStart = BX.create(
            'div',
            {
                attrs: {
                    className: 'task-detail-sidebar-item',
                    id: 'start-date'
                },
                html: '<div class="task-detail-sidebar-item-title">'+BX.message('CUSTOM_TASK_DATE_START')+'</div><div class="task-detail-sidebar-item-value"><span id="task-detail-start">'+BX.message('CUSTOM_TASK_NO')+'</span><span id="task-detail-start-clear" class="task-detail-sidebar-item-value-delete"></span></div>'
            }
        );

        $('#staged-date').after(divStart);
    }else
    {
        let textStart = startElement.querySelector('.task-detail-sidebar-item-value').innerHTML;
        startElement.querySelector('.task-detail-sidebar-item-value').innerHTML = '<span id="task-detail-start">'+textStart+'</span><span id="task-detail-start-clear" class="task-detail-sidebar-item-value-delete"></span>';
    }

    if (finishElement === null)
    {
        var divFinish = BX.create(
            'div',
            {
                attrs: {
                    className: 'task-detail-sidebar-item',
                    id: 'finish-date'
                },
                html: '<div class="task-detail-sidebar-item-title">'+BX.message('CUSTOM_TASK_DATE_FINISH')+'</div><div class="task-detail-sidebar-item-value"><span id="task-detail-finish">'+BX.message('CUSTOM_TASK_NO')+'</span><span id="task-detail-finish-clear" class="task-detail-sidebar-item-value-delete"></span></div>'
            }
        );

        $('#start-date').after(divFinish);
    } else
    {
        let textFinish = finishElement.querySelector('.task-detail-sidebar-item-value').innerHTML;
        finishElement.querySelector('.task-detail-sidebar-item-value').innerHTML =  '<span id="task-detail-finish">'+textFinish+'</span><span id="task-detail-finish-clear" class="task-detail-sidebar-item-value-delete"></span>';
    }

    CustomTasks.initStart(parameters);
};


CustomTasks.initStart = function(parameters)
{
    this.parameters = parameters || {};
    this.layout = {
        stagesWrap: BX("tasksStagesWrap"),
        stages: BX("tasksStages"),
        epicTitle: BX("tasksEpicTitle"),
        epicContainer: BX("tasksEpicContainer")
    };
    this.workingTime = { start : { hours: 0, minutes: 0 }, end : { hours: 0, minutes: 0 }};
    this.taskId = this.parameters.taskId;
    this.urlAjax = this.parameters.urlAjax;

    this.start = BX.type.isNotEmptyString(this.parameters.start) ? this.parameters.start : "";
    this.finish = BX.type.isNotEmptyString(this.parameters.finish) ? this.parameters.finish : "";

    this.layout.start = BX("task-detail-start");
    this.layout.finish = BX("task-detail-finish");

    this.layout.startClear = BX("task-detail-start-clear");
    this.layout.finishClear = BX("task-detail-finish-clear");

    if (!this.layout.start)
    {
        return;
    }
    if (!this.layout.finish)
    {
        return;
    }

    BX.bind(this.layout.start, "click", BX.proxy(this.onStartClick, this));
    BX.bind(this.layout.finish, "click", BX.proxy(this.onFinishClick, this));

    BX.bind(this.layout.startClear, "click", BX.proxy(this.clearStart, this));
    BX.bind(this.layout.finishClear, "click", BX.proxy(this.clearFinish, this));
};

CustomTasks.onStartClick = function(event)
{
    var now = new Date();
    var today = new Date(Date.UTC(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        this.workingTime.end.hours,
        this.workingTime.end.minutes
    ));

    BX.calendar({
        node: this.layout.start,
        field: "",
        form: "",
        bTime: true,
        value: this.start ? this.start : today,
        bHideTimebar: false,
        bCompatibility: true,
        bCategoryTimeVisibilityOption: 'tasks.bx.calendar.start',
        bTimeVisibility: (
            this.calendarSettings ? (this.calendarSettings.startTimeVisibility === 'Y') : false
        ),
        callback_after: BX.proxy(function(value, time) {
            this.setValueDate(value, 'start');
        }, this)
    });
};

CustomTasks.onFinishClick = function(event)
{
    var now = new Date();
    var today = new Date(Date.UTC(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        this.workingTime.end.hours,
        this.workingTime.end.minutes
    ));

    BX.calendar({
        node: this.layout.finish,
        field: "",
        form: "",
        bTime: true,
        value: this.finish ? this.finish : today,
        bHideTimebar: false,
        bCompatibility: true,
        bCategoryTimeVisibilityOption: 'tasks.bx.calendar.finish',
        bTimeVisibility: (
            this.calendarSettings ? (this.calendarSettings.finishTimeVisibility === 'Y') : false
        ),
        callback_after: BX.proxy(function(value, time) {
            this.setValueDate(value, 'finish');
        }, this)
    });
};

CustomTasks.setValueDate = function(time, event)
{
    this.start = BX.calendar.ValueToString(time, true, false);

    if (event == "start")
    {
        this.layout.start.innerHTML = BX.date.format(
            BX.date.convertBitrixFormat('DD.MM.YYYY HH:MI:SS'),
            time,
            null,
            false
        );
        this.updateValueDate(this.layout.start.innerHTML, event);
    }
    if (event == "finish")
    {
        this.layout.finish.innerHTML = BX.date.format(
            BX.date.convertBitrixFormat('DD.MM.YYYY HH:MI:SS'),
            time,
            null,
            false
        );
        this.updateValueDate(this.layout.finish.innerHTML, event);
    }
};

CustomTasks.clearStart = function()
{
    this.start = "";
    this.layout.start.innerHTML = BX.message('CUSTOM_TASK_NO');
    this.updateValueDate(null, 'clear_start');
};

CustomTasks.clearFinish = function()
{
    this.finish = "";
    this.layout.finish.innerHTML = BX.message('CUSTOM_TASK_NO');
    this.updateValueDate(null, 'clear_finish');
};

CustomTasks.updateValueDate = function(time, event)
{
    BX.ajax({
        url: this.urlAjax,
        data: {
            idTask: this.taskId,
            typeTime: event,
            time: time
        },
        method: 'POST',
        dataType: 'json',
        timeout: 30,
        async: true,
        processData: true,
        scriptsRunFirst: true,
        emulateOnload: true,
        start: true,
        cache: false,
        onsuccess: function(data){

        },
        onfailure: function(){
            console.log('Error in '+this.urlAjax);
        }
    });
};