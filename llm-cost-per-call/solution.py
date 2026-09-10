def cost(tokens_in, tokens_out, price_in, price_out):
    c = tokens_in / 1000 * price_in + tokens_out / 1000 * price_out
    return f'{c:.4f}'
