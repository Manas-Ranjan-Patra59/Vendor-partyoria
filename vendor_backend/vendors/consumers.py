import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import VendorChat, Vendor

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.vendor_id = self.scope['url_route']['kwargs']['vendor_id']
        self.room_group_name = f'chat_{self.vendor_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        sender_id = text_data_json['sender_id']
        receiver_id = text_data_json['receiver_id']

        # Save message to database
        await self.save_message(sender_id, receiver_id, message)

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender_id': sender_id,
                'receiver_id': receiver_id,
            }
        )

    async def chat_message(self, event):
        message = event['message']
        sender_id = event['sender_id']
        receiver_id = event['receiver_id']

        await self.send(text_data=json.dumps({
            'message': message,
            'sender_id': sender_id,
            'receiver_id': receiver_id,
        }))

    @database_sync_to_async
    def save_message(self, sender_id, receiver_id, message):
        sender = Vendor.objects.get(id=sender_id)
        receiver = Vendor.objects.get(id=receiver_id)
        
        VendorChat.objects.create(
            sender=sender,
            receiver=receiver,
            message=message
        )