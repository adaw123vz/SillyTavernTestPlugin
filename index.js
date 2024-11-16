import { appendMediaToMessage, extension_prompt_types, getRequestHeaders, saveSettingsDebounced, setExtensionPrompt, substituteParamsExtended } from '../../../../script.js';
import { appendFileContent, uploadFileAttachment } from '../../../chats.js';
import { doExtrasFetch, extension_settings, getApiUrl, getContext, modules, renderExtensionTemplateAsync } from '../../../extensions.js';
import { registerDebugFunction } from '../../../power-user.js';
import { SECRET_KEYS, secret_state, writeSecret } from '../../../secrets.js';
import { POPUP_RESULT, POPUP_TYPE, callGenericPopup } from '../../../popup.js';
import { extractTextFromHTML, isFalseBoolean, isTrueBoolean, onlyUnique, trimToEndSentence, trimToStartSentence, getStringHash, regexFromString } from '../../../utils.js';
import { SlashCommandParser } from '../../../slash-commands/SlashCommandParser.js';
import { SlashCommand } from '../../../slash-commands/SlashCommand.js';
import { ARGUMENT_TYPE, SlashCommandArgument, SlashCommandNamedArgument } from '../../../slash-commands/SlashCommandArgument.js';
import { commonEnumProviders } from '../../../slash-commands/SlashCommandCommonEnumsProvider.js';
import { animation_duration } from '../../../../script.js';

const MODULE_NAME = 'SillyTavernTestPlugin';

/**
 * Получает случайное слово из списка предопределённых слов.
 * @returns {Promise<string>} Случайное слово
 */
async function getRandomWord() {
    console.log('SillyTavernTestPlugin: Вызов функции getRandomWord');
    const words = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo'];
    const randomIndex = Math.floor(Math.random() * words.length);
    const selectedWord = words[randomIndex];
    console.log(`SillyTavernTestPlugin: Выбрано слово "${selectedWord}"`);
    return selectedWord;
}

/**
 * Регистрирует функцию вызова GetRandomWord.
 */
function registerFunctionTools() {
    try {
        
        
        const context = SillyTavern.getContext();
        
        console.log(context);
        
        const { isToolCallingSupported, registerFunctionTool } = context;

        
        console.log(isToolCallingSupported, registerFunctionTool);
        
    if (typeof isToolCallingSupported !== 'function') {
        console.log('SillyTavernTestPlugin: tool calling is not supported');
        return false;
    } 


        console.log('SillyTavernTestPlugin: Начало регистрации функции вызова "GetRandomWord"');

        const randomWordSchema = {
            $schema: 'http://json-schema.org/draft-04/schema#',
            type: 'object',
            properties: {
                requester: {
                    type: 'string',
                    description: 'Имя пользователя, запрашивающего слово',
                }
            },
            required: ['requester']
        };

        registerFunctionTool({
            name: 'GetRandomWord',
            displayName: 'Получить случайное слово',
            description: 'Возвращает одно из пяти предопределённых слов. Используйте, когда нужно получить случайное кодовое слово.',
            parameters: randomWordSchema,
            action: async (args) => {
                console.log('SillyTavernTestPlugin: Вызов функции "GetRandomWord" с аргументами:', args);
                const word = await getRandomWord();
                console.log(`SillyTavernTestPlugin: Функция "GetRandomWord" вернула слово "${word}"`);
                return word;
            },
            formatMessage: ({ requester }) => {
                const message = `${requester} запросил случайное слово.`;
                console.log(`SillyTavernTestPlugin: Форматирование сообщения: "${message}"`);
                return message;
            }
        });

        console.log('SillyTavernTestPlugin: Функция вызова "GetRandomWord" успешно зарегистрирована.');
    } catch (error) {
        console.error('SillyTavernTestPlugin: Ошибка при регистрации функций вызова', error);
    }
}

/**
 * Добавляет кнопку "Создать привязку" в интерфейс.
 */
function addCreateBindingButton() {
    console.log('SillyTavernTestPlugin: Добавление кнопки "Создать привязку"');

    const buttonHtml = `
        <div id="create_binding_button" class="list-group-item flex-container flexGap5">
            <div class="fa-solid fa-link extensionsMenuExtensionButton" title="Создать привязку"></div>
            Создать привязку
        </div>
    `;

    const dropdownHtml = `
        <div id="create_binding_dropdown">
            <ul class="list-group">
                <li class="list-group-item" id="confirm_create_binding">Подтвердить создание привязки</li>
                <li class="list-group-item" id="cancel_create_binding">Отмена</li>
            </ul>
        </div>
    `;

    // Определяем контейнер для добавления кнопки
    const getMenuContainer = () => $(document.getElementById('extensionsMenu'));

    // Добавляем кнопку в меню расширений
    getMenuContainer().append(buttonHtml);
    console.log('SillyTavernTestPlugin: Кнопка "Создать привязку" добавлена в интерфейс');

    // Добавляем выпадающее меню в тело документа
    $(document.body).append(dropdownHtml);
    console.log('SillyTavernTestPlugin: Выпадающее меню добавлено в тело документа');

    // Обработчики событий для элементов выпадающего меню
    $('#create_binding_dropdown #confirm_create_binding').on('click', function () {
        console.log('SillyTavernTestPlugin: Нажата кнопка "Подтвердить создание привязки"');
        registerFunctionTools();
        $('#create_binding_dropdown').fadeOut(animation_duration);
        toastr.success('Привязка успешно создана!');
        console.log('SillyTavernTestPlugin: Привязка успешно создана и зарегистрирована');

        // Отключаем кнопку после создания привязки
        $('#create_binding_button').off('click');
        $('#create_binding_button').css('opacity', '0.5');
        $('#create_binding_button div').attr('title', 'Привязка уже создана');
        console.log('SillyTavernTestPlugin: Кнопка "Создать привязку" отключена');
    });

    $('#create_binding_dropdown #cancel_create_binding').on('click', function () {
        console.log('SillyTavernTestPlugin: Нажата кнопка "Отмена"');
        $('#create_binding_dropdown').fadeOut(animation_duration);
    });

    const button = $('#create_binding_button');
    const dropdown = $('#create_binding_dropdown');
    dropdown.hide();

    // Создаём Popper для управления позиционированием выпадающего меню
    let popper = Popper.createPopper(button.get(0), dropdown.get(0), {
        placement: 'bottom',
    });
    console.log('SillyTavernTestPlugin: Popper для выпадающего меню создан');

    // Обработчик кликов для открытия/закрытия выпадающего меню
    $(document).on('click touchend', function (e) {
        const target = $(e.target);
        if (target.is(dropdown) || target.closest(dropdown).length) return;
        if (target.is(button) && !dropdown.is(':visible')) {
            console.log('SillyTavernTestPlugin: Нажата кнопка "Создать привязку"');
            e.preventDefault();
            dropdown.fadeIn(animation_duration);
            popper.update();
            console.log('SillyTavernTestPlugin: Выпадающее меню отображено');
        } else {
            dropdown.fadeOut(animation_duration);
            console.log('SillyTavernTestPlugin: Выпадающее меню скрыто');
        }
    });

    console.log('SillyTavernTestPlugin: Кнопка и выпадающее меню настроены');
}

jQuery(function () {
    console.log('SillyTavernTestPlugin: Инициализация расширения');
    addCreateBindingButton();
    console.log('SillyTavernTestPlugin: Расширение инициализировано');
});
