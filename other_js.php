<?php
defined('B_PROLOG_INCLUDED') || die;

CJSCore::RegisterExt(
    'custom_tasks',
    [
        'js' => '/local/templates/bitrix24/js/other_js/tasks/js/custom_tasks.js',
        'lang' => '/local/templates/bitrix24/js/other_js/tasks/lang/'. LANGUAGE_ID .'/custom_tasks.js.php',
        'css' => '/local/templates/bitrix24/js/other_js/tasks/css/custom_tasks.css',
        'rel' => ['ajax']
    ]
);

CJSCore::Init(['custom_tasks']);

$profileTemplates = [
    'tasks_user' => ltrim(\Bitrix\Main\Config\Option::get('tasks', 'paths_task_user_entry', '', SITE_ID), '/'),
    'task_group' => ltrim(\Bitrix\Main\Config\Option::get('tasks', 'paths_task_group_entry', '', SITE_ID), '/')
];

// Код для детальной страницы задачи
if (CComponentEngine::parseComponentPath('/', $profileTemplates, $arVars) == 'tasks_user' || CComponentEngine::parseComponentPath('/', $profileTemplates, $arVars) == 'task_group')
{
    AddEventHandler("main", "OnBeforeProlog", "MyOnBeforePrologHandler", 50);
    function MyOnBeforePrologHandler()
    {

        global $APPLICATION, $USER;

        $urlTask = $APPLICATION->GetCurPage();
        $idTask = explode('/', $urlTask);
        $idTask = array_values(array_diff($idTask, array('')));
        $idTask = end($idTask);

        $idUser = $USER->GetID();
        $arUser = $USER->GetByID($idUser)->Fetch();

        $userDepartment = $arUser['UF_DEPARTMENT'][0];

        $haveHead = false;
        $listUsers = [];
        $listDepartment = [];
        if (CModule::IncludeModule("tasks")) {
            CModule::IncludeModule("intranet");
            $obPerms = new \Bitrix\Tasks\Access\Component\ConfigPermissions();
            $arRolesResult = $obPerms->getUserGroups();

            foreach ($arRolesResult as $itemRole)
            {
                if ($itemRole['id'] == 10)
                {
                    foreach ($itemRole['members'] as $usersElement)
                    {
                        if ($usersElement['type'] == 'users')
                            $listUsers[] = $usersElement['id'];
                        if ($usersElement['type'] == 'groups' && $usersElement['id'] == 0)
                            $haveHead = true;
                        if ($usersElement['type'] == 'departments')
                            $listDepartment[] = $usersElement['id'];
                    }
                }
            }
            // Если в роле указана группа "Руководителям"
            $isHead = false;
            if ($haveHead)
            {
                $treeDepartment = [];
                $obDepartment = \CIBlockSection::GetList(["SORT" => "ASC"], ['IBLOCK_ID' => 5, 'CHECK_PERMISSIONS' => 'N'], false, ["IBLOCK_ID", "ID", "NAME", "IBLOCK_SECTION_ID", "UF_HEAD"]);

                while ($arDataDep = $obDepartment->Fetch()) {
                    $treeDepartment[] = $arDataDep;
                }

                foreach ($treeDepartment as $element) {
                    if ($element['UF_HEAD'] == $idUser) {
                        $isHead = true;
                        break;
                    }
                }
            }

            if ($isHead || in_array($idUser, $listUsers) || in_array($userDepartment, $listDepartment) || in_array(0, $listUsers))
            {
                $asset = \Bitrix\Main\Page\Asset::getInstance();
                $asset->addString('
                    <script> 
                        $(document).ready(function () { 
                            new CustomTasks.StartCreate({
                                urlAjax: "/local/templates/bitrix24/js/other_js/tasks/ajax.php",
                                taskId:' . $idTask . '
                            }); 
                        }); 
                    </script>
                ');
            }
        }
    }
}
