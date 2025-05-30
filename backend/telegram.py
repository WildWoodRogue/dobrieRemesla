from aiogram import Bot
from typing import Union


users_id = [5106244821]
token = '7557548103:AAHPRTLwKbeV5bd0N-Lf9laaRHLnZBbs7GQ'
async def send_message_to_user(
    user_id: Union[int, str],
    text: str,
    parse_mode: str = None,
    disable_web_page_preview: bool = None,
    disable_notification: bool = None,
    reply_to_message_id: int = None,
    **kwargs
):

    try:
        bot = Bot(token=token)
        message = await bot.send_message(
            chat_id=user_id,
            text=text,
            parse_mode=parse_mode,
            disable_web_page_preview=disable_web_page_preview,
            disable_notification=disable_notification,
            reply_to_message_id=reply_to_message_id,
            **kwargs
        )
        return message
    except Exception as e:
        print(f"Ошибка при отправке сообщения: {e}")
        return None
    
