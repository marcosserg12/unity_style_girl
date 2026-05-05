<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Novo Pedido</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
    .wrap { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
    .header { background: #7B0D1E; padding: 28px 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; letter-spacing: .05em; }
    .header p { color: #f0c4c4; margin: 6px 0 0; font-size: 13px; }
    .body { padding: 28px 32px; }
    .meta { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; }
    .badge { background: #f5f5f5; border-radius: 6px; padding: 10px 16px; flex: 1; min-width: 120px; }
    .badge span { display: block; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: .08em; }
    .badge strong { display: block; color: #222; font-size: 15px; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    thead th { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: #888; border-bottom: 1px solid #eee; padding: 6px 8px; text-align: left; }
    tbody td { padding: 10px 8px; font-size: 14px; color: #333; border-bottom: 1px solid #f0f0f0; vertical-align: top; }
    .total-row { font-weight: bold; color: #7B0D1E; font-size: 16px; }
    .section-title { font-size: 12px; text-transform: uppercase; letter-spacing: .1em; color: #7B0D1E; font-weight: bold; margin: 20px 0 8px; }
    .address-box { background: #fafafa; border-left: 3px solid #7B0D1E; padding: 12px 16px; border-radius: 4px; font-size: 14px; color: #444; line-height: 1.6; }
    .footer { background: #f9f9f9; text-align: center; padding: 16px; font-size: 12px; color: #aaa; border-top: 1px solid #eee; }
  </style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <h1>Unity Girl Style</h1>
    <p>Novo pedido recebido!</p>
  </div>

  <div class="body">
    <div class="meta">
      <div class="badge">
        <span>Pedido</span>
        <strong>#{{ $order->order_number }}</strong>
      </div>
      <div class="badge">
        <span>Data</span>
        <strong>{{ $order->created_at->setTimezone('America/Sao_Paulo')->format('d/m/Y H:i') }}</strong>
      </div>
      <div class="badge">
        <span>Pagamento</span>
        <strong>{{ match($order->payment_method) {
          'pix'          => 'PIX',
          'credit_card'  => 'Cartão de Crédito',
          'mercado_pago' => 'Mercado Pago',
          default        => $order->payment_method ?? '-',
        } }}</strong>
      </div>
      <div class="badge">
        <span>Cliente</span>
        <strong>{{ $order->user->name ?? ($order->shipping_address['recipient_name'] ?? '-') }}</strong>
      </div>
    </div>

    <p class="section-title">Itens do Pedido</p>
    <table>
      <thead>
        <tr>
          <th>Produto</th>
          <th>Tam.</th>
          <th>Cor</th>
          <th style="text-align:right">Qtd</th>
          <th style="text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>
        @foreach($order->items as $item)
        @php $snap = $item->product_snapshot ?? []; @endphp
        <tr>
          <td>{{ $snap['name'] ?? '-' }}</td>
          <td>{{ $snap['size'] ?? '-' }}</td>
          <td>{{ $snap['color'] ?? '-' }}</td>
          <td style="text-align:right">{{ $item->quantity }}</td>
          <td style="text-align:right">R$ {{ number_format($item->total_price, 2, ',', '.') }}</td>
        </tr>
        @endforeach
        <tr>
          <td colspan="4" style="text-align:right;font-size:13px;color:#888">Total</td>
          <td style="text-align:right" class="total-row">R$ {{ number_format($order->total, 2, ',', '.') }}</td>
        </tr>
      </tbody>
    </table>

    @php $addr = $order->shipping_address ?? []; @endphp
    @if(!empty($addr['street']))
    <p class="section-title">Endereço de Entrega</p>
    <div class="address-box">
      {{ $addr['recipient_name'] ?? '' }}<br>
      {{ $addr['street'] }}, {{ $addr['number'] ?? '' }}
      @if(!empty($addr['complement'])) — {{ $addr['complement'] }} @endif
      <br>
      {{ $addr['neighborhood'] ?? '' }} — {{ $addr['city'] ?? '' }}/{{ $addr['state'] ?? '' }}<br>
      CEP: {{ $addr['zip_code'] ?? '' }}
      @if(!empty($addr['whatsapp']))
      <br>WhatsApp: {{ $addr['whatsapp'] }}
      @endif
    </div>
    @elseif(!empty($addr['whatsapp']))
    <p class="section-title">Contato</p>
    <div class="address-box">
      Retirada no local — WhatsApp: {{ $addr['whatsapp'] }}
    </div>
    @endif
  </div>

  <div class="footer">
    Unity Girl Style &copy; {{ date('Y') }} — Notificação automática
  </div>
</div>
</body>
</html>
