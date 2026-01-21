import Foundation

struct QuoteEntry {
    let text: String
    let author: String
}

struct QuotesData {
    static let all: [QuoteEntry] = [
        QuoteEntry(text: "Wealth consists not in having great possessions, but in having few wants.", author: "Epictetus"),
        QuoteEntry(text: "Man is not worried by real problems so much as by his imagined anxieties about real problems.", author: "Epictetus"),
        QuoteEntry(text: "First say to yourself what you would be; and then do what you have to do.", author: "Epictetus"),
        QuoteEntry(text: "It's not what happens to you, but how you react to it that matters.", author: "Epictetus"),
        QuoteEntry(text: "The key is to keep company only with people who uplift you, whose presence calls forth your best.", author: "Epictetus")
    ]
}
