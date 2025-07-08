curl -X POST http://localhost:3000/print \
-H "Content-Type: application/json" \
-d '{
  "content": [
    { "type": "text", "text": "Qery Store", "align": "center", "style": "b" },
    { "type": "text", "text": "Thanks for your purchase!", "align": "center" },
    { "type": "line" },
    { "type": "text", "text": "2x Burger @ $3.00", "align": "left" },
    { "type": "text", "text": "$6.00", "align": "right" },
    { "type": "line" },
    { "type": "text", "text": "TOTAL", "align": "left", "style": "b" },
    { "type": "text", "text": "$6.00", "align": "right", "style": "b" },
    { "type": "cut" }
  ]
}'
