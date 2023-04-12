<?php
define('STOP_STATISTICS', true);
define("NO_KEEP_STATISTIC", true);
define("NOT_CHECK_PERMISSIONS", true);
require_once($_SERVER['DOCUMENT_ROOT'] . '/bitrix/modules/main/include/prolog_before.php');

if (CModule::IncludeModule("tasks"))
{
    $idTask = $_POST['idTask'];
    $arTask = CTasks::GetByID($idTask)->Fetch();

    $arFields = [];
    if($_POST['typeTime'] == 'start')
    {
        $arFields['START_DATE_PLAN'] = $_POST['time'];
        $arFields['END_DATE_PLAN'] = $arTask['END_DATE_PLAN'];
    }
    if($_POST['typeTime'] == 'finish')
    {
        $arFields['END_DATE_PLAN'] = $_POST['time'];
        $arFields['START_DATE_PLAN'] = $arTask['START_DATE_PLAN'];
    }
    if ($_POST['typeTime'] == 'clear_start')
    {
        $arFields['START_DATE_PLAN'] = '';
        $arFields['END_DATE_PLAN'] = $arTask['END_DATE_PLAN'];
    }
    if ($_POST['typeTime'] == 'clear_finish')
    {
        $arFields['END_DATE_PLAN'] = '';
        $arFields['START_DATE_PLAN'] = $arTask['START_DATE_PLAN'];
    }

    $obTask = new CTasks;
    $obTask->Update($idTask, $arFields);
}
