import { getContext } from '../../../extensions.js';
import { animation_duration } from '../../../../script.js';
import Popper from 'popper.js'; // Убедитесь, что Popper доступен
import $ from 'jquery'; // Убедитесь, что jQuery доступен

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

        console.log('SillyTavernTestPlugin: Функция вызова "GetRandomWord" успешно зарегистрирована.');
    } catch (error) {
        console.error('SillyTavernTestPlugin: Ошибка при регистрации функций вызова', error);
    }
}

function addCreateBindingButton() {
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

    const getMenuContainer = () => $(document.getElementById('bindings_menu_container') ?? document.getElementById('extensionsMenu'));
    getMenuContainer().append(buttonHtml);

    $(document.body).append(dropdownHtml);
    const button = $('#create_binding_button');
    const dropdown = $('#create_binding_dropdown');
    dropdown.hide();

    let popper = Popper.createPopper(button.get(0), dropdown.get(0), {
        placement: 'bottom',
    });

    $('#create_binding_dropdown #confirm_create_binding').on('click', function () {
        registerFunctionTools();
        dropdown.fadeOut(animation_duration);
        toastr.success('Привязка успешно создана!');
        // Отключаем кнопку после создания привязки
        button.off('click');
        button.css('opacity', '0.5');
        button.find('div').attr('title', 'Привязка уже создана');
    });

    $('#create_binding_dropdown #cancel_create_binding').on('click', function () {
        dropdown.fadeOut(animation_duration);
    });

    $(document).on('click touchend', function (e) {
        const target = $(e.target);
        if (target.is(dropdown) || target.closest(dropdown).length) return;
        if (target.is(button) && !dropdown.is(':visible')) {
            e.preventDefault();

            dropdown.fadeIn(animation_duration);
            popper.update();
        } else {
            dropdown.fadeOut(animation_duration);
        }
    });
}

jQuery(function () {
    addCreateBindingButton();
});
