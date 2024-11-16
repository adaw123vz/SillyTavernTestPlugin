import { getContext } from '../../../extensions.js';

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
    } catch (error) {
        console.error('SillyTavernTestPlugin: Ошибка при регистрации функций вызова', error);
    }
}

jQuery(function () {
    registerFunctionTools();
});
