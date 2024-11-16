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
    const selectedWord = words[randomIndex];
    console.log(`[${MODULE_NAME}] getRandomWord: Выбрано слово "${selectedWord}"`);
    return selectedWord;
}

/**
 * Регистрирует функцию вызова в контексте Silly Tavern.
 */
function registerFunctionTools() {
    try {
        const context = getContext();
        console.log(`[${MODULE_NAME}] Получение контекста:`, context);

if (context.isToolCallingSupported()) {
    console.log("Function tool calling is supported");
} else {
    console.log("Function tool calling is not supported");
}

        const { registerFunctionTool } = context;
        if (!registerFunctionTool) {
            console.warn(`[${MODULE_NAME}] Функции вызова не поддерживаются в текущем контексте.`);
            return;
        }

        console.log(`[${MODULE_NAME}] Регистрируем функцию вызова "GetRandomWord"...`);

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
                console.log(`[${MODULE_NAME}] Функция "GetRandomWord" вызвана с аргументами:`, args);
                try {
                    const word = await getRandomWord();
                    console.log(`[${MODULE_NAME}] Функция "GetRandomWord" вернула: "${word}"`);
                    return word;
                } catch (error) {
                    console.error(`[${MODULE_NAME}] Ошибка при выполнении "GetRandomWord":`, error);
                    return 'Ошибка при получении случайного слова.';
                }
            },
            formatMessage: ({ requester }) => {
                const message = `${requester} запросил случайное слово.`;
                console.log(`[${MODULE_NAME}] formatMessage: "${message}"`);
                return message;
            }
        });

        console.log(`[${MODULE_NAME}] Функция вызова "GetRandomWord" успешно зарегистрирована.`);
    } catch (error) {
        console.error(`[${MODULE_NAME}] Ошибка при регистрации функции вызова:`, error);
    }
}

jQuery(function () {
    console.log(`[${MODULE_NAME}] Загрузка расширения...`);
    registerFunctionTools();
});
