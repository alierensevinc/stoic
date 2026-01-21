
import Foundation

extension QuotesData {
    static var short: [QuoteEntry] {
        return all.filter { $0.text.count < 60 }
    }
}
