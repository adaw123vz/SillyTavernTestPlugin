import { getContext } from '../../../extensions.js';
import { SlashCommand } from '../../../slash-commands/SlashCommand.js';
import { ARGUMENT_TYPE, SlashCommandArgument, SlashCommandNamedArgument } from '../../../slash-commands/SlashCommandArgument.js';
import { commonEnumProviders } from '../../../slash-commands/SlashCommandCommonEnumsProvider.js';
import { SlashCommandParser } from '../../../slash-commands/SlashCommandParser.js';
import { isTrueBoolean } from '../../../utils.js';
import { POPUP_TYPE, callGenericPopup } from '../../../popup.js';

export { MODULE_NAME };

const MODULE_NAME = 'SillyTavernTestPlugin';

/**
 * Получает случайное слово из списка предопределённых слов.
 * @returns {Promise<string>} Случайное слово
 */
async function getRandomWord() {
    const words = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo'];
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
}

/**
 * Регистрирует функцию вызова и добавляет кнопку в интерфейс.
 */
function registerFunctionTools() {
    try {
        const { registerFunctionTool } = getContext();
        if (!registerFunctionTool) {
            console.debug('SillyTavernTestPlugin: Функции вызова не поддерживаются');
            return;
        }

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
                const word = await getRandomWord();
                return word;
            },
            formatMessage: ({ requester }) => {
                return `${requester} запросил случайное слово.`;
            }
        });

        // Добавление кнопки в интерфейс
        addGetWordButton();
        // Регистрация команды
        registerGetWordCommand();

    } catch (error) {
        console.error('SillyTavernTestPlugin: Ошибка при регистрации функций вызова', error);
    }
}

/**
 * Добавляет кнопку "Получить слово" в меню расширений.
 */
function addGetWordButton() {
    const buttonHtml = `
        <div id="get_word_button" class="list-group-item flex-container flexGap5">
            <div class="fa-solid fa-random extensionsMenuExtensionButton" title="Получить слово"></div>
            Получить слово
        </div>
    `;
    const dropdownHtml = `
        <div id="get_word_dropdown">
            <ul class="list-group">
                <li class="list-group-item" data-action="getword">Получить случайное слово</li>
            </ul>
        </div>
    `;

    const getMenuContainer = () => $(document.getElementById('extensionsMenu') || document.getElementById('extensionsMenuContainer'));
    getMenuContainer().append(buttonHtml);
    $(document.body).append(dropdownHtml);

    $('#get_word_dropdown li').on('click', function () {
        $('#get_word_dropdown').fadeOut(200);
        invokeGetRandomWord();
    });

    const button = $('#get_word_button');
    const dropdown = $('#get_word_dropdown');
    dropdown.hide();

    let popper = Popper.createPopper(button.get(0), dropdown.get(0), {
        placement: 'bottom-start',
    });

    $(document).on('click touchend', function (e) {
        const target = $(e.target);
        if (target.is(dropdown) || target.closest(dropdown).length) return;
        if (target.is(button) && !dropdown.is(':visible')) {
            e.preventDefault();
            dropdown.fadeIn(200);
            popper.update();
        } else {
            dropdown.fadeOut(200);
        }
    });
}

/**
 * Вызывает функцию GetRandomWord через контекст.
 */
async function invokeGetRandomWord() {
    const context = getContext();
    const requester = context.name1 || 'Пользователь';
    try {
        const result = await context.callFunctionTool('GetRandomWord', { requester });
        if (result) {
            context.sendSystemMessage('generic', `Случайное кодовое слово: **${result}**`, { isSmallSys: true });
        } else {
            context.sendSystemMessage('generic', `Не удалось получить случайное слово.`, { isSmallSys: true });
        }
    } catch (error) {
        console.error('SillyTavernTestPlugin: Ошибка при вызове функции GetRandomWord', error);
        context.sendSystemMessage('generic', `Произошла ошибка при получении случайного слова.`, { isSmallSys: true });
    }
}

/**
 * Регистрирует команду /getword для вызова функции получения случайного слова.
 */
function registerGetWordCommand() {
    SlashCommandParser.addCommandObject(SlashCommand.fromProps({
        name: 'getword',
        aliases: ['gw'],
        callback: async (args, value) => {
            return await invokeGetRandomWord();
        },
        helpString: 'Получить случайное кодовое слово.',
        returns: 'случайное слово',
        namedArgumentList: [],
        unnamedArgumentList: []
    }));
}

jQuery(function () {
    registerFunctionTools();
});
