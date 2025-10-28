export interface LegacyOrder {
    userId: number;
    userName: string;
    orderId: number;
    prodId: number;
    value: number;
    date: Date;
}

/**
 * Format:
 * userId,userName,orderId,prodId,value,date
 * 
 * userId - numeric | length 10 | 0 padded
 * userName - text | length 45 | space padded
 * userName - text | length 45 | space padded
 * orderId - numeric | length 10 | 0 padded
 * prodId - numeric  | length 10 | 0 padded
 * value - numeric (decimal)| length 12 | space padded 
 * date - numerics (YYYYMMDD) | length 8
 */
export function parseLegacyOrders(data: string): LegacyOrder[] {
    const lines = data.split('\n');
    const orders: LegacyOrder[] = [];

    for (const line of lines) {
        // skip empty lines
        if (line.trim().length === 0) {
            continue;
        }

        // Maybe use regex to validate line format here
        const userId = parseInt(line.substring(0, 10).trim(), 10);
        const userName = line.substring(10, 55).trim();
        const orderId = parseInt(line.substring(55, 65).trim(), 10);
        const prodId = parseInt(line.substring(65, 75).trim(), 10);
        const value = parseFloat(line.substring(75, 87).trim());
        const date = line.substring(87, 95).trim();

        const dateyear = parseInt(date.substring(0, 4), 10);
        const datemonth = parseInt(date.substring(4, 6), 10) - 1;
        const dateday = parseInt(date.substring(6, 8), 10);

        orders.push({
            userId,
            userName,
            orderId,
            prodId,
            value,
            date: new Date(dateyear, datemonth, dateday),
        });
    }

    return orders;
}
